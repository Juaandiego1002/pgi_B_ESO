# Retornos y Amarres

Aplicación web para un negocio de servicios esotéricos. Consta de una **página pública** (landing) donde los clientes pueden consultar servicios, enviar solicitudes y mensajes de contacto, y de un **panel de administración** para gestionar servicios, solicitudes, testimonios, mensajes y usuarios administradores.

## Stack tecnológico

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (configuración CSS-first en `src/app/globals.css`) y **shadcn/ui**
- **Prisma 6** con **SQLite** como base de datos
- **JWT** propio con `jose` para la autenticación (no se usa NextAuth en tiempo de ejecución)
- **Zod v4** para validaciones compartidas entre cliente y servidor
- **react-hook-form**, **react-query**, **recharts**, **Sonner**, entre otras librerías de UI

> Todo el contenido de la aplicación (nombres de campos, estados, textos y mensajes de error) está en español.

## Requisitos

- Node.js (compatible con Next.js 16)
- npm para el desarrollo local (el despliegue usa bun)

## Puesta en marcha

1. **Instalar dependencias**

   ```bash
   npm install
   ```

2. **Configurar variables de entorno**

   Crea un archivo `.env` en la raíz del proyecto:

   ```env
   DATABASE_URL="file:../db/custom.db"
   JWT_SECRET="cambia-este-valor-por-una-clave-segura"
   ```

   - Prisma resuelve las rutas `file:` relativas a la carpeta `prisma/`, por eso se usa `file:../db/custom.db` para apuntar a `db/custom.db` en la raíz (la carpeta `db/` debe existir).
   - No uses la ruta del entorno de despliegue (`/home/z/my-project/db/custom.db`) en local: en Windows se resolvería como `C:\home\z\...`.

3. **Preparar la base de datos y generar el cliente de Prisma**

   ```bash
   npm run db:push
   npm run db:generate
   ```

   Opcionalmente, carga los datos de ejemplo:

   ```bash
   npm run seed
   ```

4. **Iniciar el servidor de desarrollo**

   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:3000`.

### Credenciales de prueba (tras ejecutar el seed)

| Rol | Correo | Contraseña |
| --- | --- | --- |
| SUPERADMIN | `admin@retornosyamarres.com` | `Admin1234` |
| ADMIN | `operador@retornosyamarres.com` | `Operador123` |

> **Ojo:** `npm run seed` no es idempotente: solo los administradores se crean con `upsert`; servicios, testimonios, solicitudes y mensajes se insertan de nuevo en cada ejecución. Si necesitas volver a sembrar, ejecuta antes `npm run db:reset`.

## Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en el puerto 3000 |
| `npm run build` | Build de producción (`output: "standalone"`) |
| `npm run start` | Servidor de producción en el puerto 3000 |
| `npm run lint` | ESLint sobre todo el proyecto |
| `npm run db:push` | Sincroniza el esquema con SQLite (`--accept-data-loss`) |
| `npm run db:generate` | Genera el cliente de Prisma |
| `npm run db:migrate` | Crea una migración de desarrollo |
| `npm run db:reset` | Reinicia la base de datos |
| `npm run seed` | Carga datos de ejemplo desde `prisma/seed.ts` |

> **Verificación de tipos:** `next.config.ts` tiene `typescript.ignoreBuildErrors: true`, por lo que `npm run build` termina correctamente aunque haya errores de tipos. Tras cualquier cambio ejecuta `npx tsc --noEmit` para comprobar la tipificación.

## Ejecución con Docker

La aplicación se empaqueta en una imagen multi-etapa basada en `node:22-alpine`. `docker-compose.yml` define dos servicios:

| Servicio | Función |
| --- | --- |
| `db` | Inicializa el fichero SQLite en el volumen compartido `db-data`, sincroniza el esquema con Prisma y expone un healthcheck. |
| `web` | Servidor standalone de Next.js. Escucha en el puerto `APP_PORT` del host (3000 por defecto) y espera a que `db` esté `healthy` antes de arrancar. |

No hay Redis, colas ni servidor de base de datos externo: SQLite es un fichero compartido a través del volumen `db-data`.

### Arranque rápido

```bash
bash up.sh
```

El script (válido desde cualquier directorio) verifica Docker y Compose, crea `.env` desde `.env.example` si no existe, ejecuta `docker compose up -d --build --remove-orphans`, espera a que ambos servicios estén `healthy` y muestra `docker compose ps` con las URLs.

Si `APP_PORT` está ocupado por otro proceso o contenedor, el script detecta el conflicto (incluso cuando Compose termina sin error pero no publica el puerto), prueba el siguiente puerto libre y guarda el valor en `.env`. También comprueba que `localhost` sirva realmente esta app: en Windows, WSL puede interceptar `localhost` en IPv6 y mostrar otro proyecto (por ejemplo un dev server de Vite) aunque Docker haya publicado el puerto. En ese caso el script descarta el puerto y elige otro libre en IPv4 e IPv6. Las URLs impresas siempre corresponden al puerto real.

### Comandos de `up.sh`

| Comando | Acción |
| --- | --- |
| `bash up.sh` o `bash up.sh up` | Construye y levanta todo, espera healthchecks y muestra URLs. |
| `bash up.sh down` | Detiene los contenedores **sin borrar** la base de datos. |
| `bash up.sh restart` | Reinicia los servicios y vuelve a esperar los healthchecks. |
| `bash up.sh logs` | Logs en tiempo real (`-f`, últimas 200 líneas). |
| `bash up.sh reset` | Pide confirmación, elimina el volumen `db-data` y levanta todo de nuevo. |

También puedes usar Compose directamente:

```bash
docker compose up -d --build --remove-orphans
docker compose ps
docker compose logs -f web
docker compose down          # conserva datos
docker compose down -v       # elimina el volumen de datos
```

### Variables de entorno

Se leen de `.env` (creado a partir de `.env.example`). No versiones `.env`.

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Ruta SQLite relativa a `prisma/`: `file:../db/custom.db` → `/app/db/custom.db`. |
| `JWT_SECRET` | Clave de firma de los JWT. **Cámbiala** antes de exponer la app. |
| `APP_PORT` | Puerto publicado en el host (por defecto `3000`). |
| `NODE_ENV` | `production` por defecto. |
| `SEED_ON_START` | Si es `true`, carga datos de ejemplo solo cuando la BD se crea por primera vez. |

### Persistencia y verificación

- Los datos viven en el volumen `db-data` (`/app/db/custom.db`). `down` los conserva; `reset` o `down -v` los borra.
- Tras el primer arranque con `SEED_ON_START=true`, las credenciales de la sección anterior siguen siendo válidas.
- Comprueba el estado con `docker compose ps`: ambos servicios deben mostrar `Up (healthy)`.
- Prueba rápida: `curl http://127.0.0.1:3000/api/services` debe devolver JSON con `success: true`.
- Si el puerto 3000 está ocupado (por ejemplo por WSL/Docker Desktop en Windows), `up.sh` elegirá automáticamente otro puerto libre y lo escribirá en `.env`. También puedes fijarlo tú con `APP_PORT=3001`. El script verifica que `localhost` no esté interceptado por WSL; como último recurso, usa la IP explícita `127.0.0.1` que aparece en las URLs.

> Los contenedores ejecutan el proceso final como usuario `nextjs` (no root). Los entrypoints usan `su-exec` únicamente para ajustar la propiedad del volumen antes de ceder el control. El build usa `next/font/google`, por lo que necesita acceso a internet durante `docker compose build`. El limitador de peticiones es en memoria: esta configuración está pensada para una sola réplica de `web`. Los scripts de `.zscripts/` siguen siendo específicos del despliegue original y no se usan aquí.

## Estructura principal

```
src/
├── app/
│   ├── page.tsx                 # Landing page pública
│   ├── admin/                   # Panel de administración (páginas)
│   ├── api/                     # Route handlers REST
│   ├── globals.css              # Tema Tailwind v4 (paleta dorada/violeta)
│   └── layout.tsx
├── components/
│   ├── admin/                   # Componentes compartidos del panel
│   ├── landing/                 # Secciones y formularios de la landing
│   └── ui/                      # Primitivas de shadcn/ui
├── lib/
│   ├── auth.ts                  # JWT, requireAdmin/requireSuperAdmin, respuestas API
│   ├── db.ts                    # Cliente de Prisma
│   ├── rate-limit.ts            # Limitación de peticiones y sanitización
│   ├── utils.ts
│   └── validations.ts           # Esquemas Zod compartidos
└── middleware.ts                # Protección de las páginas /admin/*
prisma/
├── schema.prisma                # AdminUser, Service, Inquiry, Testimonial, ContactMessage
└── seed.ts
db/custom.db                     # Base de datos SQLite local
```

## Modelo de datos

- **AdminUser**: usuarios administradores (`SUPERADMIN` / `ADMIN`). No existe registro de clientes.
- **Service**: servicios con categoría, precio, imagen, orden y flag `activo`.
- **Inquiry**: solicitudes de los clientes (`NUEVO`, `CONTACTADO`, `EN_NEGOCIACION`, `CONFIRMADO`, `COMPLETADO`, `DESCARTADO`) con origen (`LANDING`, `WHATSAPP`, `REDES`, `REFERIDO`, `OTRO`).
- **Testimonial**: testimonios con calificación y flag `aprobado`.
- **ContactMessage**: mensajes genéricos de contacto con flag `atendido`.

## API

Todas las rutas responden con `{ "success": true, "data": ... }` o `{ "success": false, "error": ... }`.

### Públicas

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Iniciar sesión |
| `POST` | `/api/inquiries` | Crear solicitud (máx. 3 cada 10 min por IP) |
| `POST` | `/api/contact` | Enviar mensaje de contacto (máx. 3 cada 10 min por IP) |
| `GET` | `/api/services` | Servicios activos (`?all=true` para el panel, requiere admin) |
| `GET` | `/api/testimonials` | Testimonios aprobados (`?all=true` para el panel, requiere admin) |

### Protegidas (requieren administrador)

- `/api/auth/session` (GET), `/api/auth/logout` (POST)
- `/api/inquiries` y `/api/inquiries/[id]` (CRUD de solicitudes)
- `/api/services` y `/api/services/[id]` (CRUD de servicios)
- `/api/testimonials` y `/api/testimonials/[id]` (CRUD de testimonios)
- `/api/contact` y `/api/contact/[id]` (gestión de mensajes)
- `/api/admins` y `/api/admins/[id]` (gestión de administradores, solo SUPERADMIN)
- `/api/stats` (métricas del dashboard)

### Autenticación

- La sesión se envía como cookie `admin_session` para las páginas SSR y como cabecera `Authorization: Bearer <token>` para la API.
- `src/middleware.ts` protege únicamente las **páginas** `/admin/*` (excepto `/admin/login`), redirigiendo con un 307 a login y añadiendo `callbackUrl`.
- Las rutas `/api/*` están fuera del middleware: cada una valida la autenticación por sí misma mediante `getAuthAdminFromRequest`.
- Las entradas públicas pasan por `sanitizeInput` y los POST públicos están limitados por IP en memoria (se reinicia al redeploy; usar Redis u otro almacén distribuido en producción).

## Convenciones de desarrollo

- No se usan Server Actions: la landing y las páginas del panel son componentes `'use client'` que consultan y mutan datos vía `/api/*` (react-query o `fetch`).
- El tema activo está en `src/app/globals.css` (variables CSS; dorado `#d4a853`, violeta místico `#2d1b4e`). El archivo `tailwind.config.ts` es legacy: no editarlo para cambios de tema.
- Los componentes de shadcn/ui se añaden con `npx shadcn@latest add`; el alias `@/*` apunta a `src/*`.
- `worklog.md` contiene el historial detallado de tareas realizadas.

## Despliegue

Los scripts de Linux en `.zscripts/` y `tests/` están preparados para el entorno de despliegue (Function Compute): Caddy en el puerto 81 haciendo de proxy inverso del servidor standalone de Next y la base SQLite empaquetada en `db/custom.db`. Son específicos de ese entorno (ruta fija `/home/z/my-project`, dependen de bun) y no deben ejecutarse ni modificarse para desarrollo local. `next.config.ts` debe conservar `output: "standalone"`.

## Pruebas

No hay framework de pruebas para la aplicación. Los archivos `tests/*.sh` son arneses bash para los scripts de despliegue, no pruebas de la app, y no son ejecutables en Windows.
