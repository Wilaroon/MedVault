# MedVault

Sistema de Historiales Clínicos Electrónicos.

Frontend en **Vite + React 18**, backend en **FastAPI + PostgreSQL**, orquestado con **Docker Compose**.

---

## Arquitectura

```
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  Frontend        │ ───► │  Backend         │ ───► │  PostgreSQL      │
│  Vite + React    │      │  FastAPI         │      │  Postgres 15     │
│  localhost:5500  │      │  localhost:8000  │      │  localhost:5433  │
└──────────────────┘      └──────────────────┘      └──────────────────┘
     npm run dev              docker compose up          contenedor
```

---

## Requisitos

| Herramienta | Versión mínima | Para qué |
|---|---|---|
| **Docker Desktop** | 4.30+ | Levantar backend + base de datos |
| **Node.js** | 20+ | Ejecutar el frontend con Vite |
| **npm** | 10+ | Gestor de paquetes (viene con Node) |

Verifica que todo esté disponible:

```bash
docker --version
docker compose version
node --version
npm --version
```

---

## Inicio rápido

Desde la raíz del repositorio (`c:/Git/MedVault`):

### 1. Levantar el backend + base de datos

```bash
docker compose up -d --build
```

Esto arranca dos contenedores:
- `medvault_db` (PostgreSQL 15) en el puerto **5433**
- `medvault_backend` (FastAPI) en el puerto **8000**

La primera vez tarda ~30s porque descarga imágenes y construye el backend. Las veces siguientes es casi inmediato.

### 2. Instalar dependencias del frontend

**Solo la primera vez** (o cuando cambie `package.json`):

```bash
cd frontend
npm install
```

### 3. Abrir el puerto del frontend

```bash
npm run dev
```

Salida esperada:

```
  VITE v5.4.21  ready in 414 ms

  ➜  Local:   http://localhost:5500/
```

Abre **http://localhost:5500** en el navegador.

---

## Credenciales de prueba

> ⚠️ Estas credenciales son para desarrollo / proyecto académico. **No usar en producción.**

El sistema tiene 3 roles: **admin** (acceso total), **médico** y **enfermería** (solo Dashboard y Pacientes en lectura).

| Rol | Cédula | Contraseña | Nombre |
|---|---|---|---|
| **admin** | `8-888-8888` | `admin123` | Administrador MedVault |
| admin | `2-100-5678` | `admin2024` | Adm. Carlos Vega |
| médico | `9-111-2222` | `medico123` | Dr. Juan Perez |
| médico | `8-555-9999` | `medico2024` | Dra. Lucia Fernandez |
| enfermería | `3-720-1234` | `enfermeria123` | Enf. Maria Torres |

El primer admin (`8-888-8888`) se **crea automáticamente** en el primer arranque si la tabla `usuarios` está vacía. Los demás se crean al ejecutar la semilla de datos (ver siguiente sección) o manualmente desde la pantalla **Usuarios** (accesible solo por admins).

### Semilla de datos de prueba

El repositorio no incluye un script de seed persistido, pero si necesitas repoblar la BD con los 15 pacientes y 5 usuarios de ejemplo, puedes:

1. Entrar como admin (`8-888-8888` / `admin123`)
2. Ir a **Usuarios** → crear los otros usuarios manualmente
3. Ir a **Pacientes** → crear pacientes con el botón **+ Nuevo paciente**

Alternativamente, pídele al equipo el script `seed.py` que se usó durante el desarrollo.

---

## Comandos disponibles

### Frontend (`cd frontend`)

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias (primera vez) |
| `npm run dev` | Servidor de desarrollo con hot-reload en `localhost:5500` |
| `npm run build` | Genera build de producción en `frontend/dist/` |
| `npm run preview` | Sirve el build de producción localmente |

### Backend + Base de datos (desde la raíz)

| Comando | Qué hace |
|---|---|
| `docker compose up -d --build` | Construye e inicia los contenedores en background |
| `docker compose up -d` | Inicia contenedores (sin reconstruir) |
| `docker compose down` | Detiene y elimina los contenedores |
| `docker compose down -v` | Detiene y **elimina los datos de la BD** |
| `docker compose logs -f backend` | Ver logs del backend en tiempo real |
| `docker compose ps` | Ver contenedores activos |

---

## Puertos

| Puerto | Servicio | URL |
|---|---|---|
| **5500** | Frontend Vite | http://localhost:5500 |
| **8000** | Backend FastAPI | http://localhost:8000 |
| **5433** | PostgreSQL | `localhost:5433` |

El proxy de Vite redirige automáticamente las llamadas a `/api/*` desde el frontend al backend en `localhost:8000`, así no hay problemas de CORS en desarrollo.

---

## Endpoints de la API

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/api/pacientes` | Lista todos los pacientes |
| `POST` | `/api/pacientes` | Crea un paciente nuevo |

Documentación interactiva (Swagger): **http://localhost:8000/docs**

---

## Estructura del proyecto

```
MedVault/
├── docker-compose.yml         Orquestación db + backend
├── README.md
├── .gitignore
│
├── backend/                   FastAPI + Postgres
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py            Endpoints y CORS
│       ├── database.py        Conexión + migraciones
│       ├── schemas.py         Modelos Pydantic
│       └── utils.py
│
├── frontend/                  Vite + React 18
│   ├── package.json
│   ├── vite.config.js         Proxy /api → backend
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx            Estado raíz y navegación
│       ├── styles.css
│       ├── api.js             Cliente HTTP
│       └── components/
│           ├── Login.jsx
│           ├── Sidebar.jsx
│           ├── Header.jsx
│           ├── Dashboard.jsx  Con gráficas SVG
│           ├── Pacientes.jsx
│           ├── PatientDetail.jsx
│           ├── NewPatientModal.jsx
│           ├── Consultas.jsx
│           ├── Alertas.jsx
│           ├── Auditoria.jsx
│           ├── Toast.jsx
│           └── charts/        Gráficas SVG puras
│               ├── DonutChart.jsx
│               ├── BarChart.jsx
│               └── AreaChart.jsx
│
└── frontend_legacy/           Bundle dc-runtime archivado (referencia)
    ├── index.html
    └── script.js
```

---

## Flujo típico de trabajo

```bash
# 1. Iniciar backend + BD (una sola vez, queda en background)
docker compose up -d

# 2. Iniciar frontend (en otra terminal)
cd frontend
npm run dev

# 3. Trabajar. Vite recarga en caliente al guardar cualquier archivo.

# 4. Al terminar
#    Frontend: Ctrl+C en la terminal de npm
#    Backend: docker compose down
```

---

## Solución de problemas

### "Docker daemon not running"
Abre Docker Desktop desde el menú de inicio y espera unos segundos a que arranque.

### El puerto 5500, 8000 o 5433 ya está en uso
Otro proceso está usando ese puerto. Puedes:
- Matar el proceso que lo usa
- O cambiar el puerto en [vite.config.js](frontend/vite.config.js) (frontend) o [docker-compose.yml](docker-compose.yml) (backend/BD)

### Errores de CORS en el navegador
No debería pasar en desarrollo (Vite usa proxy). Si ocurre, verifica que el backend está corriendo: `docker compose ps`.

### El backend no encuentra la BD
Espera unos segundos después de `docker compose up`. El backend tiene reintentos automáticos (`database.py`) y muestra `✅ Base de datos inicializada` cuando conecta.

### Reset completo de la base de datos
```bash
docker compose down -v
docker compose up -d --build
```

⚠️ Esto elimina todos los pacientes registrados.

### Reset limpio del frontend
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## Stack técnico

**Frontend**
- React 18 · Vite 5 · framer-motion (animaciones)
- Gráficas SVG puras, sin librerías de charting
- Estilos inline (sin CSS framework)

**Backend**
- FastAPI 0.110 · Uvicorn · Pydantic v2
- psycopg2-binary (driver Postgres)
- CORS abierto para desarrollo

**Base de datos**
- PostgreSQL 15 (Alpine)
- Migraciones idempotentes en `database.py`
- Datos persistidos en volumen Docker `postgres_data`

👥 Autores y ContribuciónEste proyecto fue desarrollado por:Anderson SantosWilaroonPerfil de GitHubPerfil de GitHubFrontend / UI Design / BackendBackend / Base de Datos


