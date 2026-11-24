# TPI - Programación IV - FoodStore

 - Nombre: Santiago Caiciia Massello
 - Comisión 3

---

## Descripción del sistema

Food Store es una aplicación web para un negocio de comidas. Los clientes se registran,
recorren el catálogo, arman un carrito y confirman un pedido indicando la dirección de entrega y
la forma de pago (efectivo o transferencia). El negocio administra categorías, productos, stock,
pedidos y usuarios desde un panel de administración.

---

## Requisitos

| Herramienta | Versión |
| --- | --- |
| Python | 3.11 – 3.13 (SQLModel 0.0.24 no funciona con 3.14) |
| Node.js | 22 o superior |
| pnpm | 9 o superior |
| PostgreSQL | 15 o superior (opcional: se acepta SQLite para desarrollo local) |

---

## Estructura

```
TPI - Programacion IV - FoodStore/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI, CORS, /docs, /redoc, routers /api/v1
│   │   ├── core/                   # config, database, security, deps, UoW, repositorio base
│   │   ├── modules/                # auth, usuarios, categorias, productos, pedidos
│   │   └── db/seed.py              # seed idempotente
│   ├── requirements.txt
│   ├── .env.example
│   └── tests/
└── frontend/
    ├── src/
    │   ├── shared/                 # api, ui, componentes de estado, layout
    │   ├── features/               # auth, categorias, productos, pedidos, usuarios
    │   ├── store/                  # authStore y cartStore (Zustand + persist)
    │   ├── routes/                 # AppRouter y ProtectedRoute
    │   └── main.tsx / App.tsx
    ├── package.json
    └── .env.example
```

---

## Instalación y ejecución

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # En Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # En Windows: copy .env.example .env
python -m app.db.seed
uvicorn app.main:app --reload
```

La API queda en `http://localhost:8000`. La documentación interactiva está en
`http://localhost:8000/docs` y la alternativa en `/redoc`.

### 2. Frontend

```bash
cd frontend
pnpm install
cp .env.example .env               # En Windows: copy .env.example .env
pnpm dev
```

La aplicación queda en `http://localhost:5173`. Para verificar tipos y compilar:

```bash
pnpm build
```

### Usuario del seed

| Usuario | Contraseña | Rol |
| --- | --- | --- |
| `admin` | `Admin1234!` | `admin` |

El seed también crea 3 categorías y 8 productos con stock. Es idempotente: se puede
ejecutar varias veces sin duplicar registros.

---

## Variables de entorno

`backend/.env` (copiar de `.env.example`):

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `DATABASE_URL` | Cadena de conexión SQLAlchemy | `sqlite:///./foodstore.db` o `postgresql://user:pass@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Clave de firma del JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |

`frontend/.env` (copiar de `.env.example`):

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `VITE_API_URL` | URL base de la API, con prefijo | `http://localhost:8000/api/v1` |

---

## Endpoints principales

| Grupo | Endpoints |
| --- | --- |
| Auth | `POST /auth/register`, `POST /auth/token`, `POST /auth/logout`, `GET /auth/me` |
| Admin | `GET /admin/usuarios`, `POST /admin/usuarios/{id}/activar`, `POST /admin/usuarios/{id}/desactivar` |
| Categorías | `GET /categorias`, `GET /categorias/{id}`, `POST`, `PUT`, `DELETE` |
| Productos | `GET /productos` (`skip`, `limit`, `search`, `categoria_id`, `disponible`), `GET /productos/{id}`, `POST`, `PUT`, `PATCH /productos/{id}/stock`, `DELETE` |
| Pedidos | `POST /pedidos`, `GET /pedidos` (`skip`, `limit`, `estado`), `GET /pedidos/resumen`, `GET /pedidos/{id}`, `PATCH /pedidos/{id}/estado`, `PATCH /pedidos/{id}/cancelar` |

Todos los listados paginados responden `{ "total": N, "items": [...] }`.


---

## Enlaces

- [Repositorio Github](https://github.com/scaiciia/TPI-Programacion_IV-FoodStore)
- [Video de demostración](https://youtu.be/Ztjb1iflVNw)
