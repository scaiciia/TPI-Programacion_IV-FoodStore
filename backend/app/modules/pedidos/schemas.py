"""Contratos HTTP del módulo pedidos."""

from datetime import datetime
from typing import Literal

from pydantic import field_validator
from sqlmodel import Field, SQLModel

ESTADOS = Literal["PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"]
FORMAS_PAGO = Literal["EFECTIVO", "TRANSFERENCIA"]


class ItemPedidoCreate(SQLModel):
    """Un ítem del carrito enviado por el cliente."""

    producto_id: int
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    """Cuerpo de POST /pedidos."""

    items: list[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FORMAS_PAGO
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: str | None = Field(default=None)

    @field_validator("items")
    @classmethod
    def validar_productos_unicos(
        cls, value: list[ItemPedidoCreate]
    ) -> list[ItemPedidoCreate]:
        """Un producto no se repite en el pedido (422)."""
        ids = [item.producto_id for item in value]
        if len(ids) != len(set(ids)):
            raise ValueError("No se pueden repetir productos en un pedido")
        return value


class DetallePedidoRead(SQLModel):
    """Línea del pedido tal como se guardó."""

    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    """DTO de salida, con sus líneas."""

    id: int
    usuario_id: int
    estado: ESTADOS
    forma_pago: FORMAS_PAGO
    direccion_entrega: str
    notas: str | None
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead]


class PedidosPaginados(SQLModel):
    """Envelope de los listados paginados."""

    total: int
    items: list[PedidoRead]


class CambioEstado(SQLModel):
    """Cuerpo de PATCH /pedidos/{id}/estado."""

    estado: ESTADOS


class ResumenPedidos(SQLModel):
    """Indicadores del panel de administración."""

    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
