#!/usr/bin/env bash
set -euo pipefail

docker compose up -d db

DB_CONTAINER_ID=$(docker compose ps -q db)

NETWORK_NAME=$(docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{end}}' "$DB_CONTAINER_ID")

# Wait when DB is ready
until docker exec -i "$DB_CONTAINER_ID" pg_isready -U postgres > /dev/null 2>&1; do
  sleep 1

done

# Run Prisma migrate command
docker run --rm -it \
  --env-file="../.env" \
  --network "$NETWORK_NAME" \
  -v "$(pwd):/usr/prisma-orm" -w /usr/prisma-orm \
  node:22-alpine npm run migrate:dev
