"""Repositorios de Pedido y DetallePedido."""

from datetime import datetime, time, timedelta

from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    """Consultas propias del dominio pedidos."""

    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def _statement(self):
        """Incluye las líneas para poder serializar sin cargas diferidas."""
        return select(Pedido).options(selectinload(Pedido.items))

    def get_with_items(self, pedido_id: int) -> Pedido | None:
        """Obtiene un pedido con sus líneas cargadas."""
        statement = self._statement().where(Pedido.id == pedido_id)
        return self.session.exec(statement).first()

    def list_by_usuario(
        self,
        usuario_id: int,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
    ) -> list[Pedido]:
        """Pedidos propios, con filtro opcional por estado."""
        statement = self._statement().where(Pedido.usuario_id == usuario_id)
        if estado is not None:
            statement = statement.where(Pedido.estado == estado)
        statement = statement.order_by(Pedido.id.desc()).offset(skip).limit(limit)
        return list(self.session.exec(statement).all())

    def list_all(
        self,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
    ) -> list[Pedido]:
        """Todos los pedidos, con filtro opcional por estado."""
        statement = self._statement()
        if estado is not None:
            statement = statement.where(Pedido.estado == estado)
        statement = statement.order_by(Pedido.id.desc()).offset(skip).limit(limit)
        return list(self.session.exec(statement).all())

    def count(
        self,
        usuario_id: int | None = None,
        estado: str | None = None,
    ) -> int:
        """Total de pedidos para la paginación."""
        statement = select(func.count()).select_from(Pedido)
        if usuario_id is not None:
            statement = statement.where(Pedido.usuario_id == usuario_id)
        if estado is not None:
            statement = statement.where(Pedido.estado == estado)
        return int(self.session.exec(statement).one())

    def count_by_estado(self, estado: str) -> int:
        """Cantidad de pedidos en un estado (para el resumen)."""
        statement = select(func.count()).select_from(Pedido).where(
            Pedido.estado == estado
        )
        return int(self.session.exec(statement).one())

    def count_hoy(self) -> int:
        """Cantidad de pedidos creados hoy."""
        hoy = datetime.now().date()
        inicio = datetime.combine(hoy, time.min)
        fin = inicio + timedelta(days=1)
        statement = (
            select(func.count())
            .select_from(Pedido)
            .where(Pedido.created_at >= inicio, Pedido.created_at < fin)
        )
        return int(self.session.exec(statement).one())

    def ingresos_entregados(self) -> float:
        """Suma de los totales de los pedidos ENTREGADO."""
        statement = select(func.sum(Pedido.total)).where(Pedido.estado == "ENTREGADO")
        total = self.session.exec(statement).one()
        return float(total or 0.0)


class DetallePedidoRepository(BaseRepository[DetallePedido]):
    """Acceso a las líneas de los pedidos."""

    def __init__(self, session: Session) -> None:
        super().__init__(session, DetallePedido)

    def get_by_pedido(self, pedido_id: int) -> list[DetallePedido]:
        """Líneas de un pedido, ordenadas por id."""
        statement = (
            select(DetallePedido)
            .where(DetallePedido.pedido_id == pedido_id)
            .order_by(DetallePedido.id)
        )
        return list(self.session.exec(statement).all())
