"""Modelo de tabla de Producto y sus relaciones."""

from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

from app.modules.categorias.models import Categoria

if TYPE_CHECKING:
    from app.modules.pedidos.models import DetallePedido


class Producto(SQLModel, table=True):
    """Producto del catálogo."""

    __tablename__ = "producto"

    id: int | None = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categoria.id")
    nombre: str = Field(index=True, max_length=150)
    descripcion: str = Field(default="")
    precio_base: float = Field(default=0.0, ge=0)
    imagen_url: str | None = Field(default=None, max_length=500)
    stock: int = Field(default=0, ge=0)
    disponible: bool = Field(default=True)
    activo: bool = Field(default=True)

    categoria: Categoria = Relationship(back_populates="productos")
    detalles: list["DetallePedido"] = Relationship(back_populates="producto")
