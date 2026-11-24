"""Endpoints de autenticación: registro, login, logout y perfil."""

from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.database import session_factory
from app.core.deps import get_current_active_user
from app.modules.auth.schemas import MensajeResponse
from app.modules.auth.service import AuthService
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def get_auth_service() -> AuthService:
    """Factory de dependencia: inyecta el Service con su fábrica de sesiones."""
    return AuthService(session_factory)


@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar usuario público",
)
def register(
    data: UserCreate,
    svc: AuthService = Depends(get_auth_service),
) -> UserPublic:
    return svc.register(data)


@router.post("/token", response_model=MensajeResponse, summary="Login OAuth2")
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    svc: AuthService = Depends(get_auth_service),
) -> MensajeResponse:
    """Establece el JWT en la cookie HttpOnly ``access_token``."""
    token = svc.authenticate(form_data.username, form_data.password)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,
        path="/",
    )
    return MensajeResponse(message="Login exitoso")


@router.post("/logout", response_model=MensajeResponse, summary="Cerrar sesión")
def logout(response: Response) -> MensajeResponse:
    """Borra la cookie de sesión."""
    response.delete_cookie(
        key="access_token",
        httponly=True,
        samesite="lax",
        secure=False,
        path="/",
    )
    return MensajeResponse(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic, summary="Perfil autenticado")
def read_me(
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
) -> UserPublic:
    """Devuelve el usuario de la sesión actual."""
    return UserPublic.model_validate(current_user)
