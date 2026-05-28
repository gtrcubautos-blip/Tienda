# GTR CUBAUTO

Tienda online de repuestos y piezas de auto para Cuba. Aplicación full-stack con panel de administración, gestión de inventario, ventas, dashboard y catálogo público.

## Stack

- **Frontend:** React 18 + Vite + TypeScript + TailwindCSS + shadcn/ui
- **Backend:** Express 5 + TypeScript
- **Base de datos:** PostgreSQL + Drizzle ORM
- **Validación:** Zod
- **API:** Contrato OpenAPI con código generado vía Orval (React Query hooks + esquemas Zod)
- **Monorepo:** pnpm workspaces
- **Runtime:** Node.js 24

## Estructura

```
.
├── artifacts/
│   ├── api-server/       # Servidor Express (API REST en /api)
│   ├── gtr-cubauto/      # Frontend React (tienda pública + panel admin)
│   └── mockup-sandbox/   # Sandbox de componentes
├── lib/
│   ├── api-client-react/ # Hooks React Query autogenerados
│   ├── api-spec/         # Especificación OpenAPI (fuente de la verdad)
│   ├── db/               # Esquema Drizzle y migraciones
│   └── ...
└── scripts/              # Utilidades
```

## Requisitos

- Node.js 24+
- pnpm 10+
- PostgreSQL 14+ (local o remoto)

## Instalación

```bash
# 1. Clona el repo
git clone <url-del-repo>
cd <carpeta>

# 2. Instala dependencias
pnpm install

# 3. Configura variables de entorno (ver sección abajo)
cp .env.example .env
# Edita .env con tus valores reales

# 4. Aplica el esquema a la base de datos
pnpm --filter @workspace/db run push
```

## Variables de entorno

Crea un archivo `.env` en la raíz con:

```bash
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/basedatos
SESSION_SECRET=una-cadena-larga-y-aleatoria-para-firmar-sesiones
PORT=5000
```

Si vas a usar Object Storage (subida de imágenes), añade también:

```bash
DEFAULT_OBJECT_STORAGE_BUCKET_ID=...
PRIVATE_OBJECT_DIR=...
PUBLIC_OBJECT_SEARCH_PATHS=...
```

## Comandos

```bash
# Desarrollo (en terminales separadas)
pnpm --filter @workspace/api-server run dev      # API en :5000
pnpm --filter @workspace/gtr-cubauto run dev     # Frontend

# Calidad
pnpm run typecheck                                # Typecheck en todo el monorepo
pnpm run build                                    # Typecheck + build

# Base de datos
pnpm --filter @workspace/db run push              # Aplicar esquema (dev)

# API
pnpm --filter @workspace/api-spec run codegen     # Regenerar hooks y esquemas desde OpenAPI
```

## Acceso al panel de administración

- Ruta: `/admin`
- Contraseña principal (Admin): `RIVERO123`
- Contraseña adicional (Director de Finanzas, sólo Dashboard y Ventas): `CESIA123`

> **⚠️ Importante:** estas contraseñas están hardcodeadas en el código fuente. Si haces público este repositorio, **cámbialas** antes de subirlo. Lo ideal es moverlas a variables de entorno.

## Funcionalidades

### Tienda pública
- Catálogo de piezas, motos y carros
- Carrito y checkout (Zelle, Tarjeta, Contra-entrega)
- Sección mayorista
- Diseño responsive (móvil y desktop)
- Tema neón verde sobre negro

### Panel de administración
- **Dashboard** 🔒 (requiere contraseña de finanzas): métricas, ventas por región, productos top
- **Inventario:** CRUD de productos, stock, categorías
- **Precios:** ajustes masivos, márgenes
- **Descuentos:** promociones activas
- **Ventas** 🔒 (requiere contraseña de finanzas): órdenes, exportar a Excel
- **Clientes:** base de datos y exportación
- **Redes Sociales:** gestión de enlaces
- **Personalizar:** colores, banners
- **Configuración:** ajustes generales

## Despliegue

El proyecto está pensado para correr en Replit Deployments, que provee hosting, HTTPS, base de datos Postgres administrada y storage. Para otros hostings necesitarás:

- Un proceso Node corriendo el API server
- Servir los archivos estáticos del frontend (`pnpm --filter @workspace/gtr-cubauto run build`)
- Una base de datos Postgres accesible vía `DATABASE_URL`

## Licencia

Propietario — todos los derechos reservados.
