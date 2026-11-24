"""Endpoints de productos. Prefijo /api/v1/productos en main.py."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.database import session_factory
from app.core.deps import require_role
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import (
    CategoriaNoEncontrada,
    ProductoNoEncontrado,
    ProductoService,
)

router = APIRouter(tags=["productos"])


def get_producto_service() -> ProductoService:
    """Factory de dependencia: inyecta el Service con su fábrica de sesiones."""
    return ProductoService(session_factory)


@router.get("", response_model=ProductosPaginados, summary="Listar productos activos")
def listar_productos(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
    categoria_id: int | None = Query(default=None),
    disponible: bool | None = Query(default=None),
    svc: ProductoService = Depends(get_producto_service),
) -> ProductosPaginados:
    return svc.listar(skip, limit, search, categoria_id, disponible)


@router.get(
    "/{id}", response_model=ProductoRead, summary="Obtener producto"
)
def detalle_producto(
    id: int,
    svc: ProductoService = Depends(get_producto_service),
) -> ProductoRead:
    try:
        return svc.obtener_por_id(id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc


@router.post(
    "",
    response_model=ProductoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear producto",
)
def alta_producto(
    data: ProductoCreate,
    _admin: Annotated[object, Depends(require_role(["admin"]))],
    svc: ProductoService = Depends(get_producto_service),
) -> ProductoRead:
    try:
        return svc.crear(data)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc


@router.put(
    "/{id}", response_model=ProductoRead, summary="Actualizar producto"
)
def actualizar_producto(
    id: int,
    data: ProductoUpdate,
    _admin: Annotated[object, Depends(require_role(["admin"]))],
    svc: ProductoService = Depends(get_producto_service),
) -> ProductoRead:
    try:
        return svc.actualizar(id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc


@router.patch(
    "/{id}/stock",
    response_model=ProductoRead,
    summary="Actualizar stock y disponibilidad",
)
def cambiar_stock(
    id: int,
    data: ProductoStockUpdate,
    _admin: Annotated[object, Depends(require_role(["admin"]))],
    svc: ProductoService = Depends(get_producto_service),
) -> ProductoRead:
    try:
        return svc.actualizar_stock(id, data)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Dar de baja un producto",
)
def borrar_producto(
    id: int,
    _admin: Annotated[object, Depends(require_role(["admin"]))],
    svc: ProductoService = Depends(get_producto_service),
) -> None:
    try:
        svc.eliminar(id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc
