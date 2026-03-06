#!/usr/bin/env sh
set -eu

# Manual production deploy script.
# Run this directly on the production server (inside VPN).

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
APP_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$APP_DIR/deploy/docker-compose.prod.yml"
NGINX_CONF_SRC="$APP_DIR/deploy/nginx/ossi2.esedu.fi.conf"
NGINX_CONF_DST="/etc/nginx/conf.d/ossi2.esedu.fi.conf"

if [ ! -f "$APP_DIR/.env" ]; then
  echo "Missing $APP_DIR/.env"
  exit 1
fi

if [ -z "${GHCR_USERNAME:-}" ] || [ -z "${GHCR_TOKEN:-}" ] || [ -z "${GHCR_OWNER:-}" ]; then
  echo "Missing GHCR_USERNAME, GHCR_TOKEN or GHCR_OWNER environment variable"
  exit 1
fi

GHCR_OWNER="${GHCR_OWNER:-}"
IMAGE_TAG="${IMAGE_TAG:-staging}"

echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin

cd "$APP_DIR"
export GHCR_OWNER
export IMAGE_TAG

docker compose -f "$COMPOSE_FILE" pull
docker compose -f "$COMPOSE_FILE" up -d db redis mongo
docker compose -f "$COMPOSE_FILE" run --rm db-migrations
docker compose -f "$COMPOSE_FILE" up -d api-gateway auth-api student-management-api notification-server messaging-server

if command -v sudo >/dev/null 2>&1; then
  SUDO=sudo
else
  SUDO=""
fi

$SUDO install -m 644 "$NGINX_CONF_SRC" "$NGINX_CONF_DST"
$SUDO nginx -t
if command -v systemctl >/dev/null 2>&1; then
  $SUDO systemctl reload nginx
else
  $SUDO service nginx reload
fi

echo "Deploy completed for tag: $IMAGE_TAG"
