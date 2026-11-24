"""Engine, creación de tablas y fábrica de sesiones."""

from collections.abc import Iterator

from sqlalchemy.orm import sessionmaker
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

connect_args = (
    {"check_same_thread": False}
    if settings.DATABASE_URL.startswith("sqlite")
    else {}
)

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args, echo=False)

# Fábrica única: la usan el UnitOfWork y la dependencia get_session.
session_factory = sessionmaker(
    bind=engine, class_=Session, expire_on_commit=False, autoflush=False
)


def create_all_tables() -> None:
    """Crea todas las tablas registradas en SQLModel.metadata."""
    # Importar los modelos garantiza que estén registrados en los metadatos.
    import app.modules.pedidos.models
    import app.modules.productos.models
    import app.modules.usuarios.models

    # Categoría se registra desde productos.models.
    SQLModel.metadata.create_all(engine)


def get_session() -> Iterator[Session]:
    """Dependencia FastAPI que provee una Session por request."""
    with session_factory() as session:
        yield session
