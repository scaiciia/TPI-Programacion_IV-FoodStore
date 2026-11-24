"""Modelo de tabla de Usuario."""

from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido


def utcnow() -> datetime:
    """Fecha/hora UTC asignada por el backend."""
    return datetime.now(timezone.utc)


class Usuario(SQLModel, table=True):
    """Usuario del sistema; baja lógica con ``disabled``."""

    __tablename__ = "usuario"

    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True, max_length=50)
    full_name: str = Field(max_length=100)
    email: str = Field(index=True, unique=True, max_length=255)
    hashed_password: str = Field(max_length=255)
    role: str = Field(default="user", max_length=20)
    disabled: bool = Field(default=False)
    created_at: datetime = Field(default_factory=utcnow)

    pedidos: list["Pedido"] = Relationship(back_populates="usuario")
