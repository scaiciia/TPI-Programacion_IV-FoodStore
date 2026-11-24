"""Endpoints de administración de usuarios."""

from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.core.database import get_session, session_factory
from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService

router = APIRouter(prefix="/api/v1/admin", tags=["admin-usuarios"])


def get_usuario_service() -> UsuarioService:
    """Factory de dependencia: inyecta el Service con la fábrica de sesiones."""
    return UsuarioService(session_factory)


@router.get("/usuarios", response_model=list[UserPublic], summary="Listar usuarios")
def listar_usuarios(
    _admin: Annotated[Usuario, Depends(require_role(["admin"]))],
    svc: UsuarioService = Depends(get_usuario_service),
) -> list[UserPublic]:
    return svc.list_all()


@router.post(
    "/usuarios/{id}/activar",
    response_model=UserPublic,
    summary="Activar usuario",
)
def activar_usuario(
    id: int,
    admin: Annotated[Usuario, Depends(require_role(["admin"]))],
    svc: UsuarioService = Depends(get_usuario_service),
) -> UserPublic:
    return svc.set_active(id, activo=True, current_id=admin.id)


@router.post(
    "/usuarios/{id}/desactivar",
    response_model=UserPublic,
    summary="Desactivar usuario",
)
def desactivar_usuario(
    id: int,
    admin: Annotated[Usuario, Depends(require_role(["admin"]))],
    svc: UsuarioService = Depends(get_usuario_service),
) -> UserPublic:
    return svc.set_active(id, activo=False, current_id=admin.id)
