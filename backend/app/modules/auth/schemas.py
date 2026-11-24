"""Contratos HTTP del módulo auth."""

from sqlmodel import SQLModel


class MensajeResponse(SQLModel):
    """Respuesta simple con un mensaje para el cliente."""

    message: str
