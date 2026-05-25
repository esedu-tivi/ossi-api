# SECURITY.md 

## Database Port Hardening (Docker Compose)



## Compose File Usage

| File | Purpose | Safe to use on prod server? |
|---|---|---|
| `docker-compose.yml` | Base development stack | **NO** |
| `docker-compose.dev.yml` | Dev extras | **NO** |
| `deploy/docker-compose.prod.yml` | Production / staging | **YES** |

> **Only `deploy/docker-compose.prod.yml` may be used on the server.**

---

## Safe Production Startup on the Server

```bash
# Correct
cd ossi-api/deploy
docker compose -f docker-compose.prod.yml up -d
```
Do not use any other methods for this.

---

## Port Security Status by Environment

### Production (`deploy/docker-compose.prod.yml`) 

Databases and cache are not exposed as host ports. Only the application port is published, bound to localhost.

| Service | Published port | Binding |
|---|---|---|
| api-gateway | 3000 | `127.0.0.1` |
| PostgreSQL | - | not published |
| MongoDB | - | not published |
| Redis | - | not published |

Services communicate with each other over Docker's internal network only.

### Development (`docker-compose.yml` + `docker-compose.dev.yml`) 

Use locally only, preferably behind a NAT or a firewall.

| Service | Port | Binding | Note |
|---|---|---|---|
| api-gateway | 3000 | all interfaces | Dev only |
| PostgreSQL | 5432 | `127.0.0.1` | Localhost-bound |
| MongoDB | 27017 | `127.0.0.1` | Localhost-bound |
| pgAdmin | 5433 | `127.0.0.1` | Localhost-bound |
| Redis | - | not published | Internal network only |
| Prisma Studio | 5555 | `127.0.0.1` | Localhost-bound |

---

## Verification Checklist (Run after deployment)

### Production: confirm no database, admin, or debug ports are exposed


Only `api-gateway` should have a published port. Everything else must be empty.
```bash
# Run this to check
docker ps --format 'table {{.Names}}\t{{.Ports}}'
```

Expected safe output in production:

```
NAMES                PORTS
api-gateway          127.0.0.1:3000->3000/tcp
db
mongo
pgadmin
redis
```



### Development: confirm all ports are localhost-bound (not 0.0.0.0)

After `npm run dev`:

```bash
Check port bindings
# All lines must show 127.0.0.1, never 0.0.0.0
docker ps --format 'table {{.Names}}\t{{.Ports}}'
```
then
```bash
Verify on Windows
# All lines must show 127.0.0.1, never 0.0.0.0
netstat -ano | findstr "5432 27017 3000 9230 9231 9232 9233 9234 5555 5433"
```
or
```bash
Verify on Linux
# All lines must show 127.0.0.1, never 0.0.0.0
ss -ltnp | grep -E '5432|27017|5433|9230|9231|9232|9233|9234|5555|3000'
```

Example of a **safe** dev output:
```
127.0.0.1:3000   → api-gateway app
127.0.0.1:9230   → api-gateway inspector
127.0.0.1:9231   → auth-api inspector
127.0.0.1:9232   → messaging-server inspector
127.0.0.1:9233   → notification-server inspector
127.0.0.1:9234   → student-management-api inspector
127.0.0.1:5432   → PostgreSQL
127.0.0.1:27017  → MongoDB
127.0.0.1:5433   → pgAdmin
127.0.0.1:5555   → Prisma Studio
```

If any of the above shows `0.0.0.0` or `*`, the port is exposed to all network interfaces, stop the stack and investigate before continuing.

---

## Notes for Developers

- Never copy `docker-compose.yml` to the server or run it in a public network.
- If you need direct database access on the server, use an SSH tunnel instead:
