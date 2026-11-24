"""Unidad de trabajo del módulo pedidos."""

from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import DetallePedidoRepository, PedidoRepository
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(UnitOfWork):
    """Coordina pedidos, líneas y productos en una sola transacción."""

    def __enter__(self) -> "PedidoUnitOfWork":
        super().__enter__()
        assert self.session is not None
        self.pedidos = PedidoRepository(self.session)
        self.detalles = DetallePedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)
        return self
