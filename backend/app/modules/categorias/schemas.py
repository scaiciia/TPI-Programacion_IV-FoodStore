"""Contratos HTTP del módulo categorías."""

from sqlmodel import Field, SQLModel


class CategoriaBase(SQLModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str = Field(default="")


class CategoriaCreate(CategoriaBase):
    """Body de POST /categorias."""


class CategoriaUpdate(SQLModel):
    """Body de PUT /categorias/{id}: campos opcionales."""

    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = None


class CategoriaRead(CategoriaBase):
    """DTO de salida."""

    id: int
