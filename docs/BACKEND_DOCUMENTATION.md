# Backend Documentation

This document describes OSSI backend service boundaries, runtime topology and API surface at a practical level.

## Architecture Overview

OSSI backend runs as a multi-service Docker Compose setup.

- `api-gateway` (Express + Apollo): main entry point for clients.
- `student-management-api` (Express REST + Prisma): business/domain data in PostgreSQL.
- `auth-api` (Express REST): login + magic-link related endpoints.
- `messaging-server` (Express + Apollo + MongoDB): messaging GraphQL API and Redis event consumers.
- `notification-server` (Express REST + MongoDB): notification reads and updates.
- `prisma-orm`: shared Prisma schema, migrations, generated Prisma client package.
- data stores: PostgreSQL, MongoDB, Redis.

### Service Communication

- External clients call `api-gateway` at `:3000/graphql`.
- `api-gateway` calls internal services using:
  - `INTERNAL_AUTH_API_URL`
  - `INTERNAL_STUDENT_MANAGEMENT_API_URL`
  - `INTERNAL_NOTIFICATION_SERVER_URL`
  - `INTERNAL_MESSAGING_SERVER_URL`
- Redis is used for pub/sub between messaging and notification-related flows.

## Runtime and Ports

### Exposed in default compose profile

- `3000` -> `api-gateway`
- `3001` -> `notification-server`
- `3002` -> `messaging-server`
- `5432` -> PostgreSQL
- `5433` -> pgAdmin
- `27017` -> MongoDB

### Development compose additions

- TS watch mode and source bind mounts for services
- Node inspect ports `9230` to `9234`
- Prisma Studio on `5555`

## API Surface

### 1) API Gateway (public)

Base URL: `http://localhost:3000/graphql`

- GraphQL endpoint exposed by `api-gateway/src/index.ts`.
- Schema and resolvers live under `api-gateway/src/graphql`.

### 2) Student Management API (internal REST)

Service root is internal container URL `http://student-management-api:3000`.

Registered route groups (`student-management-api/src/app.ts`):

- `/students`
- `/teachers`
- `/qualification`
- `/qualification/projects`
- `/qualification/projects/tags`
- `/qualification/parts`
- `/qualification/units`
- `/qualification/titles`
- `/workplace`
- `/internship`
- `/jobSupervisor`

Implementation files:

- students: `student-management-api/src/handlers/student-router.ts`
- teachers: `student-management-api/src/handlers/teacher-router.ts`
- qualifications/titles/units/parts/projects/tags:
  - `student-management-api/src/handlers/qualification-router.ts`
  - `student-management-api/src/handlers/titles-router.ts`
  - `student-management-api/src/handlers/units-router.ts`
  - `student-management-api/src/handlers/parts-router.ts`
  - `student-management-api/src/handlers/projects-router.ts`
  - `student-management-api/src/handlers/project-tags-router.ts`
- workplace + job supervisors:
  - `student-management-api/src/handlers/workplace-router.ts`
  - `student-management-api/src/handlers/job-supervisor-router.ts`
- internship: `student-management-api/src/handlers/internship-router.ts`

### 3) Auth API (internal REST)

Service root is internal container URL `http://auth-api:3000`.

- `POST /login`
- `POST /auth/magic-link/request`
- `POST /auth/magic-link/verify`

Implementation:

- `auth-api/src/routes/auth-router.ts`
- `auth-api/src/routes/magicLink-router.ts`

### 4) Notification API

Base URL (host): `http://localhost:3001/notifications`

Routes in `notification-server/src/handlers/notification-router.ts`:

- `GET /notifications`
- `GET /notifications/:id`
- `GET /notifications/unread_notification_count`
- `POST /notifications/:id/mark_as_read`
- `POST /notifications/send_notification`

### 5) Messaging Server

Base URL (host): `http://localhost:3002/graphql`

- GraphQL schema: `messaging-server/src/schema.ts`
- Resolvers: `messaging-server/src/resolvers.ts`
- Mongo models:
  - `messaging-server/src/models/message.ts`
  - `messaging-server/src/models/conversation.ts`
- Redis subscriptions and publish flow in `messaging-server/src/index.ts`

## Data and Migrations

Prisma schema and migrations:

- schema: `prisma-orm/prisma/schema.prisma`
- migrations: `prisma-orm/prisma/migrations`
- seed: `prisma-orm/prisma/seed.ts`

Commands:

- generate + build: `npm --workspace=prisma-orm run build`
- dev migrations: `npm --workspace=prisma-orm run migrate:dev`
- production migrations: `npm --workspace=prisma-orm run migrate:prod`
- seed: `npm run seed`
- Prisma Studio: `npm run studio`

## Environment Variables

Configured in root `.env`.

Core variables:

- Auth/security:
  - `JWT_SECRET_KEY`
  - `DISABLE_ROLE_BASED_ACCESS_CONTROL`
- Internal service routing:
  - `INTERNAL_AUTH_API_URL`
  - `INTERNAL_STUDENT_MANAGEMENT_API_URL`
  - `INTERNAL_NOTIFICATION_SERVER_URL`
  - `INTERNAL_MESSAGING_SERVER_URL`
- PostgreSQL:
  - `DATABASE_URL`
  - `DATABASE_URL_TEST`
  - `INTERNAL_DB_HOSTNAME`
  - `INTERNAL_DB_PORT`
  - `INTERNAL_DB_USERNAME`
  - `INTERNAL_DB_PASSWORD`
  - `INTERNAL_DB_DATABASE`
- Magic-link/email:
  - `APP_URL`
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_USER`
  - `SMTP_PASS`

## Development Workflow

1. `npm install`
2. `npm --workspace=prisma-orm run build`
3. `npm run dev`
4. run tests with `npm test`
5. stop stack with `npm stop`

## Production Deployment Workflow

Deployment files:

- GitHub image publish workflow: `.github/workflows/publish-ghcr.yml`
- Production compose: `deploy/docker-compose.prod.yml`
- Nginx proxy config: `deploy/nginx/ossi2.esedu.fi.conf`
- Server-side deploy script: `deploy/deploy-on-server.sh`

Production model:

- GitHub Actions builds and pushes images to GHCR
- deployment is manually executed on production server (inside VPN)

### Server-side deploy prerequisites

- Docker + Docker Compose plugin installed
- Nginx installed and managed by `systemctl` or `service`
- deploy user can run Docker and reload Nginx (directly or via `sudo`)
- DNS `ossi2.esedu.fi` points to the production server
- repository cloned on server (example `/opt/ossi-api`)
- production `.env` created at repo root on server

### Required environment variables for deploy script

- `GHCR_USERNAME`
- `GHCR_TOKEN`
- `GHCR_OWNER` (GitHub org/user owning GHCR images)
- `IMAGE_TAG` (optional, default `staging`)
- `APPLY_NGINX_CONF` (optional, default `0`; set `1` only when you want to apply `ossi2.esedu.fi` nginx config)

### Manual deploy commands (run on server)

```bash
cd /opt/ossi-api
git pull
export GHCR_USERNAME="<ghcr-user>"
export GHCR_TOKEN="<ghcr-read-token>"
export GHCR_OWNER="<github-owner>"
export IMAGE_TAG="staging"
./deploy/deploy-on-server.sh
```

Alternative for parent-directory layout (`/srv/ossi2`):

```bash
cd /srv/ossi2
sudo -u ossi2 -H sh -lc '
  cd /srv/ossi2/ossi-api &&
  set -a &&
  . /srv/ossi2/.deploy.env &&
  set +a &&
  ./deploy/deploy-on-server.sh
'
```

You can also use wrapper script `deploy/run-from-parent.sh` from parent directory:

```bash
sudo -u ossi2 -H sh -lc '/srv/ossi2/ossi-api/deploy/run-from-parent.sh'
```

Apply Nginx config only when needed:

```bash
export APPLY_NGINX_CONF=1
./deploy/deploy-on-server.sh
```

### What the deploy script does

1. Validates required env vars and `.env`.
2. Logs Docker into GHCR.
3. Pulls latest images for selected tag.
4. Starts infra services (`db`, `redis`, `mongo`).
5. Runs Prisma migrations via `db-migrations`.
6. Starts backend services.
7. Optionally installs/reloads Nginx config for `ossi2.esedu.fi` only when `APPLY_NGINX_CONF=1`.

## Notes

- `student-management-api` initializes qualification data from ePeruste if DB is empty (`student-management-api/src/index.ts`).
- In test profile, migrations use `DATABASE_URL_TEST` via `docker-compose.test.yml`.
