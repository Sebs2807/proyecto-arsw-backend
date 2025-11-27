<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="96" alt="NestJS" />
</p>

# Synapse CRM — Backend (NestJS)

Synapse CRM es una plataforma B2B para empresas de servicios y equipos de ventas tecnológicas que unifica colaboración, comunicación y automatización inteligente en un solo entorno. Este repositorio contiene el backend construido con NestJS, TypeORM y MySQL, con capacidades de tiempo real vía WebSockets, integración de llamadas con LiveKit y autenticación OAuth con Google (incluyendo Google Calendar).

API base por defecto: `https://localhost:3000/v1` — Documentación Swagger: `https://localhost:3000/docs`

---

## Integrantes

- Santiago Diaz Rojas
- Camilo Andres Quintero Rodriguez
- Juan Sebastian Velasquez Rodriguez
- Camilo Andres Fernandez Diaz

## Introducción

Synapse CRM es una plataforma B2B diseñada para empresas de servicios y equipos de ventas tecnológicas que buscan unificar colaboración, comunicación y automatización inteligente en un solo entorno. Su interfaz visual organiza y prioriza clientes potenciales, facilitando la gestión de procesos comerciales complejos y el trabajo en equipo.

La propuesta de valor se centra en la integración de inteligencia artificial y funcionalidades en tiempo real: las llamadas se gestionan de manera instantánea y los agentes virtuales optimizan la interacción con los clientes, permitiendo a los equipos enfocarse en cerrar oportunidades de mayor valor.

Con Synapse CRM, las empresas de servicios y ventas tech pueden:

- Reducir tiempos de respuesta en el contacto con clientes.
- Optimizar la productividad de los equipos de ventas.
- Contar con un flujo de trabajo centralizado, eficiente e integrado con herramientas digitales clave.

## Antecedentes

En el entorno B2B, especialmente en empresas de servicios y ventas tecnológicas, la gestión de clientes potenciales se ha vuelto cada vez más compleja. Los equipos de ventas trabajan con múltiples canales (llamadas, correos, reuniones virtuales), y la coordinación interna exige herramientas colaborativas que reduzcan la fricción entre áreas. Los CRMs tradicionales organizan la información, pero carecen de una integración fluida de comunicación en tiempo real y automatización inteligente, lo que obliga a los equipos a depender de varias aplicaciones fragmentadas.

## Problema que resuelve

- Fragmentación de herramientas: alternar entre CRM, correo, calendarios y apps de llamadas provoca pérdida de tiempo y errores.
- Baja eficiencia en la interacción: llamadas y seguimientos fuera del flujo del CRM dificultan trazabilidad y decisiones.
- Falta de automatización inteligente: poca asistencia en tiempo real para insights, recordatorios, transcripciones y agendamiento.
- Desalineación en procesos B2B: en ventas tech y servicios, impacta conversión y fidelización.

## Valor agregado de Synapse CRM

- CRM todo en uno: colaboración, comunicación y gestión de leads en una sola plataforma.
- Comunicación en tiempo real: llamadas integradas y centralizadas en las tarjetas de cliente.
- Agentes de IA configurables: automatizan llamadas salientes, agenda, recordatorios y respuestas frecuentes.
- Escalabilidad y trazabilidad: visibilidad completa del pipeline, del contacto inicial a la conversión.

---

## Arquitectura y Tecnologías

- NestJS 10 + TypeScript
- MySQL 8 (TypeORM) con `synchronize: true` para desarrollo
- Autenticación: OAuth2 Google + JWT (access/refresh en cookies httpOnly)
- Google Calendar API (lectura/creación de eventos)
- WebSockets (Socket.IO) para colaboración en tiempo real (drag & drop, llamadas activas)
- LiveKit para voz/video en tiempo real (emisión de tokens desde backend)
- Swagger/OpenAPI en `https://localhost:3000/docs`
- Versionado de API por URL (`/v1/...`)
- HTTPS local con certificados generados por `mkcert`

Estructura de módulos principales (`src/app/modules`): `auth`, `users`, `workspaces`, `users-workspaces`, `boards`, `lists`, `cards`, `calendar` y módulo `livekit`.

---

## Diagrams (espacio reservado)

Coloca tus diagramas en la carpeta que prefieras (por ejemplo `docs/`) y actualiza las rutas de las imágenes a continuación.

### Diagrama de Infraestructura

![Infraestructura]()

### Diagrama de Componentes

![Componentes]()

### BPMN

![BPMN]()

---

## Endpoints principales

Base: `https://localhost:3000/v1`

Autenticación (`/auth`)
- `GET /auth/google` inicia OAuth con Google.
- `GET /auth/google/callback` callback de Google; setea `accessToken` y `refreshToken` en cookies httpOnly y redirige a `FRONTEND_URL`.
- `GET /auth/refresh-token` refresca access token desde cookie `refreshToken`.
- `GET /auth/profile` requiere JWT; devuelve `{ id, email }` del usuario autenticado.

Usuarios (`/users`)
- `GET /users/paginated` consulta paginada (workspace-aware).
- `GET /users/autocomplete` búsqueda por email.
- `GET /users/:email` obtiene usuario por email.
- `POST /users` crea usuario.
- `PATCH /users/:id` actualiza usuario.
- `DELETE /users/:id` elimina usuario.

Workspaces (`/workspaces`) — requiere JWT
- `GET /workspaces` lista workspaces del usuario autenticado.

Relación usuarios-workspaces (`/workspaces/users`) — requiere JWT
- `POST` añade usuario a workspace `{ userId, workspaceId, role }`.
- `PATCH` actualiza rol `{ userId, workspaceId, role }`.
- `DELETE` remueve usuario `{ userId, workspaceId }`.

Boards (`/boards`) — requiere JWT
- `POST /boards` crea board (miembros, workspace, color).
- `GET /boards/paginated` listado paginado por usuario.
- `GET /boards/:id` obtiene board.
- `PATCH /boards/:id` actualiza board (emite evento realtime `board:updated`).
- `DELETE /boards/:id` elimina board.

Lists (`/lists`)
- `GET /lists/board/:boardId` listas por board.
- `GET /lists/:id` obtiene lista.
- `POST /lists` crea lista.
- `PUT /lists/:id` actualiza lista.
- `DELETE /lists/:id` elimina lista.

Cards (`/cards`)
- `GET /cards` lista todas.
- `GET /cards/:id` obtiene card.
- `POST /cards` crea card con `{ cardData, listId }`.
- `PUT /cards/:id` actualiza card.
- `DELETE /cards/:id` elimina card.

Calendario (`/calendar`) — requiere JWT
- `GET /calendar/google-events?start=...&end=...` lista eventos del usuario.
- `POST /calendar/google-events` crea evento (acepta `summary`, `description`, `attendees`, `start/end` por fecha o dateTime).

LiveKit (`/livekit`)
- `GET /livekit/token?room=...&identity=...&name=...` devuelve `{ token, url }` para unirse a una sala.

### Eventos WebSocket (canal por board)
- `joinBoard` unirse a room de un board y recibir snapshot inicial.
- Llamadas: `call:started`, `call:ended`, `call:requestState`.
- Drag & drop de cards: `card:dragStart`, `card:dragUpdate`, `card:dragEnd`.

> Explora y prueba todos los endpoints en Swagger: `https://localhost:3000/docs`.

---

## Requisitos

- Node.js 20+ y npm
- MySQL 8 (local o vía Docker)
- `mkcert` para certificados locales (HTTPS)

Opcional (local con Docker): Docker y Docker Compose.

---

## Configuración de entorno

Crear archivo `.env` en la raíz con valores similares a:

```env
# URLs
BACKEND_URL=https://localhost:3000
FRONTEND_URL=https://localhost:5173

# Base de datos
DB_HOST=localhost
DB_PORT=3307           # 3307 si usas docker-compose.local.yaml
DB_USER=synapseuser
DB_PASSWORD=synapsepass
DB_NAME=synapse
DB_SSL=false           # true si usas SSL y colocas certs/ca.pem

# JWT
JWT_ACCESS_SECRET=changeme-access
JWT_REFRESH_SECRET=changeme-refresh
JWT_SECRET=changeme-compat

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# LiveKit
LIVEKIT_API_KEY=your-livekit-key
LIVEKIT_API_SECRET=your-livekit-secret
LIVEKIT_URL=https://your-livekit-host
```

Genera certificados locales (Windows PowerShell):

```powershell
./certificados.ps1
```

Esto creará `certs/synapse+1-key.pem` y `certs/synapse+1.pem`, usados por el servidor HTTPS local.

---

## Ejecución local

Instalación de dependencias:

```bash
npm install
```

Desarrollo (watch + HTTPS):

```bash
npm run start:dev
```

Producción (build + run):

```bash
npm run build
npm run start:prod
```

Swagger estará disponible en `https://localhost:3000/docs` y la API en `https://localhost:3000/v1`.

---

## Ejecución con Docker (local)

Levanta MySQL y backend en modo desarrollo (hot-reload):

```bash
docker compose -f docker-compose.local.yaml up --build
```

Esto expone MySQL en `localhost:3307` y el backend en `https://localhost:3000`.

---

## Tests y cobertura

```bash
npm test            # unit tests
npm run test:cov    # cobertura (lcov y resumen)
```

---

## Seguridad y autenticación

- Las cookies `accessToken` y `refreshToken` se establecen como `httpOnly`, `secure`, `sameSite=strict`.
- El guard JWT lee el access token desde la cookie `accessToken`.
- El refresh se realiza vía `GET /v1/auth/refresh-token` y rota el refresh token almacenado.
- Las apps de frontend deben enviar credenciales (`withCredentials`) y respetar `FRONTEND_URL` para CORS.

---

## Licencia

Este proyecto se distribuye como `UNLICENSED` (ver `package.json`).

---

## Recursos

- NestJS Docs: https://docs.nestjs.com
- TypeORM Docs: https://typeorm.io
- LiveKit: https://docs.livekit.io
- Google APIs (OAuth/Calendar): https://developers.google.com

