"""Endpoints de categorías. Prefijo /api/v1/categorias en main.py."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.database import session_factory
from app.core.deps import require_role
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)

router = APIRouter(tags=["categorias"])


def get_categoria_service() -> CategoriaService:
    """Factory de dependencia: inyecta el Service con su fábrica de sesiones."""
    return CategoriaService(session_factory)


@router.get("", response_model=list[CategoriaRead], summary="Listar categorías activas")
def listar_categorias(
    svc: CategoriaService = Depends(get_categoria_service),
) -> list[CategoriaRead]:
    return svc.listar()


@router.get(
    "/{id}", response_model=CategoriaRead, summary="Obtener categoría"
)
def detalle_categoria(
    id: int,
    svc: CategoriaService = Depends(get_categoria_service),
) -> CategoriaRead:
    try:
        return svc.obtener_por_id(id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc


@router.post(
    "",
    response_model=CategoriaRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear categoría",
)
def alta_categoria(
    data: CategoriaCreate,
    _admin: Annotated[object, Depends(require_role(["admin"]))],
    svc: CategoriaService = Depends(get_categoria_service),
) -> CategoriaRead:
    try:
        return svc.crear(data)
    except NombreDuplicado as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc


@router.put(
    "/{id}", response_model=CategoriaRead, summary="Actualizar categoría"
)
def actualizar_categoria(
    id: int,
    data: CategoriaUpdate,
    _admin: Annotated[object, Depends(require_role(["admin"]))],
    svc: CategoriaService = Depends(get_categoria_service),
) -> CategoriaRead:
    try:
        return svc.actualizar(id, data)
    except (CategoriaNoEncontrada, NombreDuplicado) as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Dar de baja una categoría",
)
def borrar_categoria(
    id: int,
    _admin: Annotated[object, Depends(require_role(["admin"]))],
    svc: CategoriaService = Depends(get_categoria_service),
) -> None:
    try:
        svc.eliminar(id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc
