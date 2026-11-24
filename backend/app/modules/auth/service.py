"""Lógica de autenticación: registro, login y logout."""

from collections.abc import Callable

from fastapi import HTTPException, status
from sqlmodel import Session

from app.core.security import create_access_token, verify_password
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    """Registro público y emisión del JWT que viaja en cookie HttpOnly."""

    def __init__(self, session_factory: Callable[[], Session]) -> None:
        self._session_factory = session_factory
        self._usuarios = UsuarioService(session_factory)

    def register(self, data: UserCreate) -> UserPublic:
        """Delega el registro al servicio de usuarios (rol ``user``)."""
        return self._usuarios.register(data)

    def authenticate(self, username: str, password: str) -> str:
        """Valida credenciales y devuelve el JWT de acceso."""
        with UsuarioUnitOfWork(self._session_factory) as uow:

            usuario = uow.usuarios.get_by_username(username)
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Credenciales incorrectas",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            if usuario.disabled:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cuenta de usuario desactivada",
                )
            return create_access_token(data={"sub": usuario.username})
