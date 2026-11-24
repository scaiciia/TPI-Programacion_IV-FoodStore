"""Contratos HTTP del módulo productos."""

from sqlmodel import Field, SQLModel

from app.modules.categorias.schemas import CategoriaRead


class ProductoBase(SQLModel):
    nombre: str = Field(min_length=1, max_length=150)
    descripcion: str = Field(default="")
    precio_base: float = Field(ge=0)
    imagen_url: str | None = Field(default=None, max_length=500)
    stock: int = Field(default=0, ge=0)
    disponible: bool = Field(default=True)
    categoria_id: int


class ProductoCreate(ProductoBase):
    """Body de POST /productos."""


class ProductoUpdate(SQLModel):
    """Body de PUT /productos/{id}: actualización parcial."""

    nombre: str | None = Field(default=None, min_length=1, max_length=150)
    descripcion: str | None = None
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: str | None = Field(default=None, max_length=500)
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None
    categoria_id: int | None = None


class ProductoStockUpdate(SQLModel):
    """Body de PATCH /productos/{id}/stock."""

    stock: int = Field(ge=0)
    disponible: bool = True


class ProductoRead(ProductoBase):
    """DTO de salida con la categoría anidada."""

    id: int
    activo: bool
    categoria: CategoriaRead | None = None


class ProductosPaginados(SQLModel):
    """Envelope de los listados paginados."""

    total: int
    items: list[ProductoRead]
