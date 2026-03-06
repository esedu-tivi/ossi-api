# prisma-orm

Shared Prisma package for OSSI backend services.

## Purpose

- Owns Prisma schema and SQL migrations
- Generates Prisma client used by backend services
- Provides seed script and Prisma Studio access

## Environment

Prisma commands use `DATABASE_URL`. In this monorepo, the default source of truth is root `.env`.

If you run commands outside Docker, make sure `DATABASE_URL` points to your local PostgreSQL instance.

## Commands

Generate Prisma client and build package:

```bash
npm run build
```

Create/apply development migration:

```bash
npm run migrate:dev
```

Apply production migrations:

```bash
npm run migrate:prod
```

Seed database:

```bash
npm run seed
```

Open Prisma Studio:

```bash
npm run studio
```

## Important Paths

- schema: `prisma/schema.prisma`
- migrations: `prisma/migrations`
- seed: `prisma/seed.ts`
