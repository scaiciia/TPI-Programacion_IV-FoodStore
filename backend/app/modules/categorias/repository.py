"""Repositorio de Categoría."""

from sqlalchemy import func
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    """Consultas propias del dominio categorías."""

    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def get_by_nombre(
        self, nombre: str, exclude_id: int | None = None
    ) -> Categoria | None:
        """Busca por nombre exacto, sin distinguir mayúsculas."""
        statement = select(Categoria).where(
            func.lower(Categoria.nombre) == nombre.strip().lower()
        )
        if exclude_id is not None:
            statement = statement.where(Categoria.id != exclude_id)
        return self.session.exec(statement).first()

    def get_activos(self) -> list[Categoria]:
        """Lista todas las categorías activas."""
        statement = (
            select(Categoria)
            .where(Categoria.activo.is_(True))
            .order_by(Categoria.id)
        )
        return list(self.session.exec(statement).all())
