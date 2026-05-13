# SECURITY.md — OSSI2 API

## Database Port Hardening (Docker Compose)



## Compose File Usage

| File | Purpose | Safe to use on server? |
|---|---|---|
| `docker-compose.yml` | Base development stack | **NO** |
| `docker-compose.dev.yml` | Dev extras | **NO** |
| `deploy/docker-compose.prod.yml` | Production / staging | **YES** |

> **Only `deploy/docker-compose.prod.yml` may be used on the server.**

---

## Safe Startup on the Server

```bash
# Correct — production stack only
cd /deploy
docker compose -f docker-compose.prod.yml up -d
```

```bash
# WRONG — never run these on the server
docker compose up -d
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
npm run dev
npm run start
```

---

## Port Security Status by Environment

### Production (`deploy/docker-compose.prod.yml`) 

Databases and cache are not exposed as host ports. Only the application port is published, bound to localhost.

| Service | Published port | Binding |
|---|---|---|
| api-gateway | 3000 | `127.0.0.1` |
| PostgreSQL | — | not published |
| MongoDB | — | not published |
| Redis | — | not published |

Services communicate with each other over Docker's internal network only.

### Development (`docker-compose.yml` + `docker-compose.dev.yml`) 

Use locally only, preferably behind a NAT or a firewall.

| Service | Port | Binding | Note |
|---|---|---|---|
| api-gateway | 3000 | all interfaces | Dev only |
| PostgreSQL | 5432 | `127.0.0.1` | Localhost-bound |
| MongoDB | 27017 | `127.0.0.1` | Localhost-bound |
| pgAdmin | 5433 | `127.0.0.1` | Localhost-bound |
| Redis | — | not published | Internal network only |
| Prisma Studio | 5555 | `127.0.0.1` | Localhost-bound |

---

## Verification Checklist (Run after deployment)

Confirm that database ports are not exposed after starting the stack:

```bash
# Check listening ports — should return empty in production
ss -ltnp | grep -E '5432|27017|80'

# Check Docker container ports
docker ps --format 'table {{.Names}}\t{{.Ports}}'
# PostgreSQL, MongoDB, and pgAdmin must not appear as host ports
```

Expected safe output in production:

```
NAMES                PORTS
api-gateway          127.0.0.1:3000->3000/tcp
db                   (empty)
mongo                (empty)
pgadmin              (empty)
```

---

## Notes for Developers

- Never copy `docker-compose.yml` to the server or run it in a public network.
- If you need direct database access on the server, use an SSH tunnel instead:
