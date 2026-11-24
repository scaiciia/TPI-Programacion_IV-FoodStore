"""Lógica de negocio de Pedido."""

from collections.abc import Callable

from sqlmodel import Session

from app.modules.pedidos.models import DetallePedido, Pedido, utcnow
from app.modules.pedidos.schemas import (
    CambioEstado,
    DetallePedidoRead,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork


class PedidoError(Exception):
    """Base de las excepciones de dominio de pedidos."""

    status_code = 400


class PedidoNoEncontrado(PedidoError):
    status_code = 404


class ProductoNoEncontrado(PedidoError):
    status_code = 404


class PedidoAjeno(PedidoError):
    status_code = 403


class StockInsuficiente(PedidoError):
    pass


class ProductoNoDisponible(PedidoError):
    pass


class ProductoRepetido(PedidoError):
    pass


class TransicionInvalida(PedidoError):
    pass


class CancelacionNoPermitida(PedidoError):
    pass


# Mapa de transiciones de la máquina de estados (RN-02).
TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoService:
    """Reglas transaccionales: stock y pedido se modifican juntos."""

    def __init__(self, session_factory: Callable[[], Session]) -> None:
        self._session_factory = session_factory

    def _get_or_404(
        self, uow: PedidoUnitOfWork, pedido_id: int
    ) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(
                f"No se encontró el pedido con id {pedido_id}"
            )
        return pedido

    def _assert_dueno(self, pedido: Pedido, usuario_id: int) -> None:
        if pedido.usuario_id != usuario_id:
            raise PedidoAjeno("El pedido no pertenece al usuario de la sesión")

    def _to_read(self, pedido: Pedido) -> PedidoRead:
        """Serializa a DTO dentro del bloque ``with`` del UoW."""
        return PedidoRead(
            id=pedido.id,
            usuario_id=pedido.usuario_id,
            estado=pedido.estado,
            forma_pago=pedido.forma_pago,
            direccion_entrega=pedido.direccion_entrega,
            notas=pedido.notas,
            total=pedido.total,
            created_at=pedido.created_at,
            updated_at=pedido.updated_at,
            items=[
                DetallePedidoRead.model_validate(item) for item in pedido.items
            ],
        )

    def _restituir_stock(
        self, uow: PedidoUnitOfWork, pedido: Pedido
    ) -> None:
        """Devuelve el stock de cada línea en la misma transacción (RN-03)."""
        for item in pedido.items:
            producto = uow.productos.get_by_id(item.producto_id)
            if producto is not None:
                producto.stock += item.cantidad
                uow.productos.add(producto)

    def crear(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        """Crea el pedido desde el carrito en una sola transacción (RN-01)."""
        with PedidoUnitOfWork(self._session_factory) as uow:
            ids = [item.producto_id for item in data.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido("No se pueden repetir productos en un pedido")

            pedido = Pedido(
                usuario_id=usuario_id,
                estado="PENDIENTE",
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=0.0,
            )
            uow.pedidos.add(pedido)

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(
                        f"No se encontró el producto con id {item.producto_id}"
                    )
                if not producto.disponible:
                    raise ProductoNoDisponible(
                        f"El producto '{producto.nombre}' no está disponible"
                    )
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}'"
                    )

                producto.stock -= item.cantidad
                uow.productos.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.detalles.add(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            pedido.updated_at = utcnow()
            result = PedidoRead(
                id=pedido.id,
                usuario_id=pedido.usuario_id,
                estado=pedido.estado,
                forma_pago=pedido.forma_pago,
                direccion_entrega=pedido.direccion_entrega,
                notas=pedido.notas,
                total=pedido.total,
                created_at=pedido.created_at,
                updated_at=pedido.updated_at,
                items=[
                    DetallePedidoRead.model_validate(item)
                    for item in uow.detalles.get_by_pedido(pedido.id)
                ],
            )
        return result

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
        usuario_id: int | None = None,
    ) -> PedidosPaginados:
        """Propios para el cliente; todos para el administrador (RN-04)."""
        with PedidoUnitOfWork(self._session_factory) as uow:
            if usuario_id is None:
                pedidos = uow.pedidos.list_all(skip, limit, estado)
                total = uow.pedidos.count(estado=estado)
            else:
                pedidos = uow.pedidos.list_by_usuario(
                    usuario_id, skip, limit, estado
                )
                total = uow.pedidos.count(usuario_id=usuario_id, estado=estado)
            result = PedidosPaginados(
                total=total, items=[self._to_read(p) for p in pedidos]
            )
        return result

    def obtener_por_id(
        self, pedido_id: int, usuario_id: int | None = None
    ) -> PedidoRead:
        """Detalle con líneas; el cliente solo puede ver los suyos."""
        with PedidoUnitOfWork(self._session_factory) as uow:
            pedido = uow.pedidos.get_with_items(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(
                    f"No se encontró el pedido con id {pedido_id}"
                )
            if usuario_id is not None:
                self._assert_dueno(pedido, usuario_id)
            result = self._to_read(pedido)
        return result

    def cambiar_estado(
        self, pedido_id: int, data: CambioEstado
    ) -> PedidoRead:
        """Avanza o cancela según la máquina de estados (RN-02, RN-03)."""
        with PedidoUnitOfWork(self._session_factory) as uow:
            pedido = uow.pedidos.get_with_items(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(
                    f"No se encontró el pedido con id {pedido_id}"
                )
            destino = data.estado
            if destino not in TRANSICIONES.get(pedido.estado, set()):
                raise TransicionInvalida(
                    f"Transición inválida: {pedido.estado} → {destino}"
                )
            if destino == "CANCELADO":
                self._restituir_stock(uow, pedido)
            pedido.estado = destino
            pedido.updated_at = utcnow()
            result = self._to_read(pedido)
        return result

    def cancelar(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        """Cancela un pedido propio en PENDIENTE (RN-03, RN-04)."""
        with PedidoUnitOfWork(self._session_factory) as uow:
            pedido = uow.pedidos.get_with_items(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(
                    f"No se encontró el pedido con id {pedido_id}"
                )
            self._assert_dueno(pedido, usuario_id)
            if pedido.estado != "PENDIENTE":
                raise CancelacionNoPermitida(
                    "Solo se puede cancelar un pedido en estado PENDIENTE"
                )
            self._restituir_stock(uow, pedido)
            pedido.estado = "CANCELADO"
            pedido.updated_at = utcnow()
            result = self._to_read(pedido)
        return result

    def resumen(self) -> ResumenPedidos:
        """Indicadores del panel de administración."""
        with PedidoUnitOfWork(self._session_factory) as uow:
            result = ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado("PENDIENTE"),
                en_preparacion=uow.pedidos.count_by_estado("EN_PREPARACION"),
                entregados=uow.pedidos.count_by_estado("ENTREGADO"),
                cancelados=uow.pedidos.count_by_estado("CANCELADO"),
                pedidos_hoy=uow.pedidos.count_hoy(),
                ingresos_entregados=uow.pedidos.ingresos_entregados(),
            )
        return result
