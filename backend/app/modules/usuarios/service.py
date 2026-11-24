"""Gestión administrativa de usuarios."""

from collections.abc import Callable

from fastapi import HTTPException, status
from sqlmodel import Session

from app.core.security import hash_password
from app.modules.usuarios.models import Usuario, utcnow
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    """Registro público y administración de usuarios."""

    def __init__(self, session_factory: Callable[[], Session]) -> None:
        self._session_factory = session_factory

    def register(self, data: UserCreate) -> UserPublic:
        """Crea un usuario con rol ``user``; 409 si username o email existen."""
        with UsuarioUnitOfWork(self._session_factory) as uow:
            if uow.usuarios.get_by_username(data.username):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El username ya está registrado",
                )
            if uow.usuarios.get_by_email(str(data.email)):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El email ya está registrado",
                )

            usuario = Usuario(
                username=data.username,
                full_name=data.full_name,
                email=str(data.email),
                hashed_password=hash_password(data.password),
                role="user",
                disabled=False,
            )
            uow.usuarios.add(usuario)
            result = UserPublic.model_validate(usuario)
        return result

    def list_all(self) -> list[UserPublic]:
        """Lista todos los usuarios, incluidos los desactivados."""
        with UsuarioUnitOfWork(self._session_factory) as uow:
            result = [UserPublic.model_validate(u) for u in uow.usuarios.get_all()]
        return result

    def set_active(
        self, user_id: int, activo: bool, current_user_id: int | None = None
    ) -> UserPublic:
        """Activa o desactiva un usuario (operación idempotente)."""
        with UsuarioUnitOfWork(self._session_factory) as uow:
            usuario = uow.usuarios.get_by_id(user_id)
            if usuario is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No se encontró el usuario con id {user_id}",
                )
            if not activo and usuario.id == current_user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Un administrador no puede desactivarse a sí mismo",
                )

            usuario.disabled = not activo
            uow.usuarios.add(usuario)
            result = UserPublic.model_validate(usuario)
        return result
