"""Repositorio de Producto."""

from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    """Consultas propias del dominio productos."""

    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def _filtrar(
        self,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ):
        """Construye el statement base de los listados públicos."""
        statement = select(Producto).where(Producto.activo.is_(True))
        if search:
            termino = f"%{search.strip().lower()}%"
            statement = statement.where(func.lower(Producto.nombre).like(termino))
        if categoria_id is not None:
            statement = statement.where(Producto.categoria_id == categoria_id)
        if disponible is not None:
            statement = statement.where(Producto.disponible == disponible)
        return statement

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> list[Producto]:
        """Lista activos con búsqueda, filtros y paginación."""
        statement = (
            self._filtrar(search, categoria_id, disponible)
            .options(selectinload(Producto.categoria))
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        )
        return list(self.session.exec(statement).all())

    def count(
        self,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> int:
        """Cuenta los activos que coinciden con los filtros."""
        statement = select(func.count()).select_from(
            self._filtrar(search, categoria_id, disponible).subquery()
        )
        return int(self.session.exec(statement).one())
