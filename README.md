# ossi-api

Monorepo for OSSI backend services.

## Services

The system is split into multiple Node.js services:

- `api-gateway`: Public GraphQL gateway (`/graphql`) for client apps.
- `student-management-api`: Internal REST API for student, teacher, internship, qualification and workplace data.
- `auth-api`: Internal REST API for login and magic-link authentication.
- `messaging-server`: GraphQL service for messaging data (MongoDB + Redis pub/sub).
- `notification-server`: REST API for notifications (MongoDB + Redis pub/sub).
- `prisma-orm`: Shared Prisma schema, client generation and migrations for PostgreSQL.

See detailed architecture and endpoint map in [docs/BACKEND_DOCUMENTATION.md](./docs/BACKEND_DOCUMENTATION.md).

## Prerequisites

- Docker-compatible container runtime (for example [Docker Desktop](https://www.docker.com/))
- Node.js 22.x (22.11.0 or newer recommended)
- npm

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Build Prisma client package once before first local development run:

```bash
npm --workspace=prisma-orm run build
```

3. Start services in development mode:

```bash
npm run dev
```

## Runtime Modes

### Development mode

```bash
npm run dev
```

- Uses `docker-compose.yml` + `docker-compose.dev.yml`
- Enables TypeScript watch mode in services
- Opens Node inspect ports:
  - `9230` api-gateway
  - `9231` auth-api
  - `9232` messaging-server
  - `9233` notification-server
  - `9234` student-management-api

### Production-like mode

```bash
npm start
```

- Uses `docker-compose.yml`
- Runs built service images

### Stop containers

```bash
npm stop
```

## Testing

Run test stack:

```bash
npm test
```

This starts PostgreSQL test DB + Prisma migrations + `student-management-api` tests through `docker-compose.test.yml`.

## Database, Migrations and Seeding

Run seed script:

```bash
npm run seed
```

Open Prisma Studio:

```bash
npm run studio
```

## Local URLs

- API Gateway GraphQL: `http://localhost:3000/graphql`
- Notification API: `http://localhost:3001/notifications`
- Messaging GraphQL: `http://localhost:3002/graphql`
- Prisma Studio (dev profile): `http://localhost:5555`
- pgAdmin: `http://localhost:5433`

## Environment Variables

Main variables are stored in `.env`.

- `DATABASE_URL`: Postgres connection for normal runtime
- `DATABASE_URL_TEST`: Postgres connection for test runtime
- `JWT_SECRET_KEY`: JWT signing/verification secret
- `INTERNAL_*_URL`: Internal service URLs used between containers
- `SMTP_*`, `APP_URL`: Magic-link email flow settings

For full variable usage, see [docs/BACKEND_DOCUMENTATION.md](./docs/BACKEND_DOCUMENTATION.md).

## Production Deployment

Repository contains:

- image publish automation: `.github/workflows/publish-ghcr.yml`
- server-side deploy assets:
  - `deploy/docker-compose.prod.yml`
  - `deploy/nginx/ossi2.esedu.fi.conf`
  - `deploy/deploy-on-server.sh`

Because production SSH is only reachable inside VPN, deployment is intentionally run manually on the server after images are published to GHCR.

Server-side deployment steps are documented in [docs/BACKEND_DOCUMENTATION.md](./docs/BACKEND_DOCUMENTATION.md).

Release checklist: [docs/RELEASE_CHECKLIST.md](./docs/RELEASE_CHECKLIST.md).
