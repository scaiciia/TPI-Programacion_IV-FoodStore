"""Lógica de negocio de Producto."""

from collections.abc import Callable

from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaRead
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    """404: el producto no existe o está dado de baja."""

    status_code = 404


class CategoriaNoEncontrada(Exception):
    """404: la categoría indicada no existe o está dada de baja."""

    status_code = 404


class ProductoService:
    """Catálogo, stock y baja lógica con commit centralizado en el UoW."""

    def __init__(self, session_factory: Callable[[], Session]) -> None:
        self._session_factory = session_factory

    def _get_or_404(
        self, uow: ProductoUnitOfWork, producto_id: int
    ) -> Producto:
        producto = uow.productos.get_by_id(producto_id)
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado(
                f"No se encontró el producto con id {producto_id}"
            )
        return producto

    def _get_categoria_or_404(
        self, uow: ProductoUnitOfWork, categoria_id: int
    ) -> Categoria:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(
                f"No se encontró la categoría con id {categoria_id}"
            )
        return categoria

    def _to_read(self, producto: Producto) -> ProductoRead:
        """Serializa dentro del UoW, con la categoría ya cargada."""
        return ProductoRead(
            id=producto.id,
            categoria_id=producto.categoria_id,
            nombre=producto.nombre,
            descripcion=producto.descripcion,
            precio_base=producto.precio_base,
            imagen_url=producto.imagen_url,
            stock=producto.stock,
            disponible=producto.disponible,
            activo=producto.activo,
            categoria=(
                CategoriaRead.model_validate(producto.categoria)
                if producto.categoria is not None
                else None
            ),
        )

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with ProductoUnitOfWork(self._session_factory) as uow:
            self._get_categoria_or_404(uow, data.categoria_id)
            producto = Producto(**data.model_dump())
            uow.productos.add(producto)
            stmt = (
                select(Producto)
                .where(Producto.id == producto.id)
                .options(selectinload(Producto.categoria))
            )
            producto = uow.session.exec(stmt).one()
            result = self._to_read(producto)
        return result

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> ProductosPaginados:
        with ProductoUnitOfWork(self._session_factory) as uow:
            productos = uow.productos.search(
                skip, limit, search, categoria_id, disponible
            )
            result = ProductosPaginados(
                total=uow.productos.count(search, categoria_id, disponible),
                items=[self._to_read(p) for p in productos],
            )
        return result

    def obtener_por_id(self, producto_id: int) -> ProductoRead:
        with ProductoUnitOfWork(self._session_factory) as uow:
            producto = self._get_or_404(uow, producto_id)
            result = self._to_read(producto)
        return result

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with ProductoUnitOfWork(self._session_factory) as uow:
            producto = self._get_or_404(uow, producto_id)
            cambios = data.model_dump(exclude_unset=True, exclude_none=True)

            if "categoria_id" in cambios:
                self._get_categoria_or_404(uow, cambios["categoria_id"])

            for field, value in cambios.items():
                setattr(producto, field, value)

            uow.productos.add(producto)
            result = self._to_read(producto)
        return result

    def actualizar_stock(
        self, producto_id: int, data: ProductoStockUpdate
    ) -> ProductoRead:
        with ProductoUnitOfWork(self._session_factory) as uow:
            producto = self._get_or_404(uow, producto_id)
            producto.stock = data.stock
            producto.disponible = data.disponible
            uow.productos.add(producto)
            result = self._to_read(producto)
        return result

    def eliminar(self, producto_id: int) -> None:
        """Baja lógica: activo = false."""
        with ProductoUnitOfWork(self._session_factory) as uow:
            producto = self._get_or_404(uow, producto_id)
            producto.activo = False
            uow.productos.add(producto)
