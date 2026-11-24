"""Endpoints de pedidos. Prefijo /api/v1/pedidos en main.py."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.database import session_factory
from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import PedidoError, PedidoService
from app.modules.usuarios.models import Usuario

router = APIRouter(tags=["pedidos"])


def get_pedido_service() -> PedidoService:
    """Factory de dependencia: inyecta el Service con su fábrica de sesiones."""
    return PedidoService(session_factory)


@router.post(
    "",
    response_model=PedidoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear pedido desde el carrito",
)
def crear_pedido(
    data: PedidoCreate,
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    svc: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return svc.crear(data, current_user.id)
    except PedidoError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc


@router.get("", response_model=PedidosPaginados, summary="Listar pedidos")
def listar_pedidos(
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    estado: str | None = Query(default=None),
    svc: PedidoService = Depends(get_pedido_service),
) -> PedidosPaginados:
    usuario_id = None if current_user.role == "admin" else current_user.id
    return svc.listar(skip, limit, estado, usuario_id)


@router.get(
    "/resumen", response_model=ResumenPedidos, summary="Resumen del negocio"
)
def resumen_pedidos(
    _admin: Annotated[object, Depends(require_role(["admin"]))],
    svc: PedidoService = Depends(get_pedido_service),
) -> ResumenPedidos:
    return svc.resumen()


@router.get(
    "/{id}", response_model=PedidoRead, summary="Obtener pedido con líneas"
)
def detalle_pedido(
    id: int,
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    svc: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    usuario_id = None if current_user.role == "admin" else current_user.id
    try:
        return svc.obtener_por_id(id, usuario_id)
    except PedidoError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc


@router.patch(
    "/{id}/estado",
    response_model=PedidoRead,
    summary="Avanzar o cancelar un pedido (admin)",
)
def cambiar_estado_pedido(
    id: int,
    data: CambioEstado,
    _admin: Annotated[object, Depends(require_role(["admin"]))],
    svc: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return svc.cambiar_estado(id, data)
    except PedidoError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc


@router.patch(
    "/{id}/cancelar",
    response_model=PedidoRead,
    summary="Cancelar un pedido propio en PENDIENTE",
)
def cancelar_pedido(
    id: int,
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    svc: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return svc.cancelar(id, current_user.id)
    except PedidoError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc
