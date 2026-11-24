"""Modelo de tabla de Categoría."""

from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    """Categoría del catálogo; baja lógica con ``activo``."""

    __tablename__ = "categoria"

    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(index=True, unique=True, max_length=100)
    descripcion: str = Field(default="")
    activo: bool = Field(default=True)

    productos: list["Producto"] = Relationship(back_populates="categoria")
