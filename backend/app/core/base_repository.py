"""Repositorio genérico: única capa que habla con la base de datos."""

from typing import Any, Generic, TypeVar

from sqlmodel import SQLModel

ModelT = TypeVar("ModelT", bound=SQLModel)


class BaseRepository(Generic[ModelT]):
    """CRUD básico para cualquier modelo SQLModel.

    No hace commit: la transacción la decide siempre el UnitOfWork.
    """

    def __init__(self, session, model: type[ModelT]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, record_id: int) -> ModelT | None:
        """Obtiene una entidad por su clave primaria, o None."""
        return self.session.get(self.model, record_id)

    def get_all(
        self,
        offset: int = 0,
        limit: int | None = None,
        order_by: Any | None = None,
    ) -> list[ModelT]:
        """Devuelve entidades con offset, límite y orden opcionales."""
        from sqlmodel import select

        statement = select(self.model)
        if order_by is not None:
            statement = statement.order_by(order_by)
        statement = statement.offset(offset)
        if limit is not None:
            statement = statement.limit(limit)
        return list(self.session.exec(statement).all())

    def add(self, instance: ModelT) -> ModelT:
        """Registra la entidad en la sesión y hace flush para obtener el ID."""
        self.session.add(instance)
        self.session.flush()
        self.session.refresh(instance)
        return instance

    def delete(self, instance: ModelT) -> None:
        """Marca la entidad para borrado físico y hace flush."""
        self.session.delete(instance)
        self.session.flush()
