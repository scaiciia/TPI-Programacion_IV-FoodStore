"""Seed idempotente: admin, categorías y productos de ejemplo.

Ejecutar desde backend/:
    python -m app.db.seed
"""

from sqlalchemy import func
from sqlmodel import Session, select

from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

CATEGORIAS = [
    ("Hamburguesas", "Hamburguesas clásicas y especiales"),
    ("Pizzas", "Pizzas a la piedra"),
    ("Bebidas", "Bebidas frías y calientes"),
]

PRODUCTOS = [
    ("Hamburguesa simple", "Medallón, lechuga y tomate", 16500.0, "Hamburguesas"),
    ("Hamburguesa doble", "Doble medallón y queso", 18900.0, "Hamburguesas"),
    ("Hamburguesa veggie", "Medallón vegetariano", 15200.0, "Hamburguesas"),
    ("Pizza margherita", "Salsa de tomate y mozzarella", 19500.0, "Pizzas"),
    ("Pizza napolitana", "Jamón, aceitunas y orégano", 21900.0, "Pizzas"),
    ("Pizza fugazzeta", "Cebolla y dos quesos", 24200.0, "Pizzas"),
    ("Coca-Cola 500ml", "Bebida gaseosa fría", 8800.0, "Bebidas"),
    ("Café con leche", "Bebida caliente", 9200.0, "Bebidas"),
]


def get_or_create(session: Session, model, where, defaults: dict):
    """Busca un registro por ``where`` y lo crea si no existe."""
    obj = session.exec(select(model).where(where)).first()
    if obj is None:
        obj = model(**defaults)
        session.add(obj)
        session.flush()
    return obj


def seed() -> None:
    """Carga los datos mínimos para que la aplicación sea demostrable."""
    create_all_tables()
    with session_factory() as session:
        admin = session.exec(
            select(Usuario).where(Usuario.username == "admin")
        ).first()
        if admin is None:
            session.add(
                Usuario(
                    username="admin",
                    full_name="Administrador Food Store",
                    email="admin@foodstore.com",
                    hashed_password=hash_password("Admin1234!"),
                    role="admin",
                    disabled=False,
                )
            )

        categorias = {}
        for nombre, descripcion in CATEGORIAS:
            categoria = get_or_create(
                session,
                Categoria,
                func.lower(Categoria.nombre) == nombre.lower(),
                {"nombre": nombre, "descripcion": descripcion, "activo": True},
            )
            categorias[nombre] = categoria.id

        for nombre, descripcion, precio, categoria in PRODUCTOS:
            get_or_create(
                session,
                Producto,
                func.lower(Producto.nombre) == nombre.lower(),
                {
                    "nombre": nombre,
                    "descripcion": descripcion,
                    "precio_base": precio,
                    "categoria_id": categorias[categoria],
                    "imagen_url": None,
                    "stock": 20,
                    "disponible": True,
                    "activo": True,
                },
            )

        session.commit()
        print("Seed completado. Admin: admin / Admin1234!")


if __name__ == "__main__":
    seed()
