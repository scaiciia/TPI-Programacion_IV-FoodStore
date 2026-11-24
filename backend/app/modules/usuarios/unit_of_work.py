"""Unidad de trabajo del módulo usuarios."""

from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.repository import UsuarioRepository


class UsuarioUnitOfWork(UnitOfWork):
    """Expone el repositorio de usuarios sobre la sesión de la transacción."""

    def __enter__(self) -> "UsuarioUnitOfWork":
        super().__enter__()
        assert self.session is not None
        self.usuarios = UsuarioRepository(self.session)
        return self
