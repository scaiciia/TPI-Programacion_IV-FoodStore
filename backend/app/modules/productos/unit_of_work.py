"""Unidad de trabajo del módulo productos."""

from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.repository import ProductoRepository


class ProductoUnitOfWork(UnitOfWork):
    """Coordina productos y categorías sobre la misma sesión."""

    def __enter__(self) -> "ProductoUnitOfWork":
        super().__enter__()
        assert self.session is not None
        self.productos = ProductoRepository(self.session)
        self.categorias = CategoriaRepository(self.session)
        return self
