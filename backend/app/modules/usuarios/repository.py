"""Repositorio de Usuario."""

from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    """Consultas propias del dominio usuarios."""

    def __init__(self, session: Session) -> None:
        super().__init__(session, Usuario)

    def get_by_username(self, username: str) -> Usuario | None:
        """Busca por username, sin distinguir mayúsculas."""
        statement = select(Usuario).where(Usuario.username == username)
        return self.session.exec(statement).first()

    def get_by_email(self, email: str) -> Usuario | None:
        """Busca por email, sin distinguir mayúsculas."""
        statement = select(Usuario).where(Usuario.email == email)
        return self.session.exec(statement).first()
