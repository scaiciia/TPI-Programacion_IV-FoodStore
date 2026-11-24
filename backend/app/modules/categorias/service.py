"""Lógica de negocio de Categoría."""

from collections.abc import Callable

from sqlmodel import Session

from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    """404: la categoría no existe o está dada de baja."""

    status_code = 404


class NombreDuplicado(Exception):
    """409: ya existe una categoría con ese nombre."""

    status_code = 409


class CategoriaService:
    """Abre el UoW en cada caso de uso y devuelve DTOs dentro del bloque."""

    def __init__(self, session_factory: Callable[[], Session]) -> None:
        self._session_factory = session_factory

    def _get_or_404(
        self, uow: CategoriaUnitOfWork, categoria_id: int
    ) -> Categoria:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(
                f"No se encontró la categoría con id {categoria_id}"
            )
        return categoria

    def _assert_nombre_unico(
        self,
        uow: CategoriaUnitOfWork,
        nombre: str,
        exclude_id: int | None = None,
    ) -> None:
        if uow.categorias.get_by_nombre(nombre, exclude_id=exclude_id):
            raise NombreDuplicado(
                f"Ya existe una categoría con el nombre '{nombre}'"
            )

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with CategoriaUnitOfWork(self._session_factory) as uow:
            self._assert_nombre_unico(uow, data.nombre)
            categoria = Categoria(
                nombre=data.nombre, descripcion=data.descripcion, activo=True
            )
            uow.categorias.add(categoria)
            result = CategoriaRead.model_validate(categoria)
        return result

    def listar(self) -> list[CategoriaRead]:
        with CategoriaUnitOfWork(self._session_factory) as uow:
            result = [
                CategoriaRead.model_validate(c)
                for c in uow.categorias.get_activos()
            ]
        return result

    def obtener_por_id(self, categoria_id: int) -> CategoriaRead:
        with CategoriaUnitOfWork(self._session_factory) as uow:
            categoria = self._get_or_404(uow, categoria_id)
            result = CategoriaRead.model_validate(categoria)
        return result

    def actualizar(
        self, categoria_id: int, data: CategoriaUpdate
    ) -> CategoriaRead:
        with CategoriaUnitOfWork(self._session_factory) as uow:
            categoria = self._get_or_404(uow, categoria_id)

            if data.nombre is not None and (
                data.nombre.lower() != categoria.nombre.lower()
            ):
                self._assert_nombre_unico(
                    uow, data.nombre, exclude_id=categoria_id
                )

            for field, value in data.model_dump(
                exclude_unset=True, exclude_none=True
            ).items():
                setattr(categoria, field, value)

            uow.categorias.add(categoria)
            result = CategoriaRead.model_validate(categoria)
        return result

    def eliminar(self, categoria_id: int) -> None:
        """Baja lógica. No libera el nombre ni oculta sus productos."""
        with CategoriaUnitOfWork(self._session_factory) as uow:
            categoria = self._get_or_404(uow, categoria_id)
            categoria.activo = False
            uow.categorias.add(categoria)
