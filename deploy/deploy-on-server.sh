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

if ! grep -Eq '^DATABASE_URL=' "$APP_DIR/.env"; then
  echo "Missing DATABASE_URL in $APP_DIR/.env"
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

# Optional frontend deploy (ossi2.0-front).
# Builds the frontend inside a Node container (no Node needed on the host)
# and publishes dist/ to the Nginx web root. The previous release is kept
# in "$FRONT_PUBLISH_DIR.prev" for rollback.
if [ "${DEPLOY_FRONTEND:-0}" = "1" ]; then
  FRONT_DIR="${FRONT_DIR:-$(CDPATH= cd -- "$APP_DIR/.." && pwd)/ossi2.0-front}"
  FRONT_BRANCH="${FRONT_BRANCH:-main}"
  FRONT_PUBLISH_DIR="${FRONT_PUBLISH_DIR:-/var/www/ossi2.esedu.fi/html}"
  FRONT_NODE_IMAGE="${FRONT_NODE_IMAGE:-docker.io/node:24-alpine}"

  if [ ! -d "$FRONT_DIR/.git" ]; then
    echo "Missing frontend git checkout: $FRONT_DIR (set FRONT_DIR)"
    exit 1
  fi

  # Vite reads VITE_* variables from .env.production (or .env) at build time.
  if [ ! -f "$FRONT_DIR/.env.production" ] && [ ! -f "$FRONT_DIR/.env" ]; then
    echo "Missing $FRONT_DIR/.env.production (VITE_* build settings)"
    exit 1
  fi

  if [ -n "$(git -C "$FRONT_DIR" status --porcelain --untracked-files=no)" ]; then
    echo "Frontend checkout has local changes, refusing to deploy: $FRONT_DIR"
    exit 1
  fi

  echo "Updating frontend ($FRONT_BRANCH) in $FRONT_DIR"
  git -C "$FRONT_DIR" fetch origin "$FRONT_BRANCH"
  git -C "$FRONT_DIR" checkout "$FRONT_BRANCH"
  git -C "$FRONT_DIR" merge --ff-only "origin/$FRONT_BRANCH"
  FRONT_REV="$(git -C "$FRONT_DIR" rev-parse --short HEAD)"

  echo "Building frontend $FRONT_REV with $FRONT_NODE_IMAGE"
  docker run --rm \
    --user "$(id -u):$(id -g)" \
    -e HOME=/tmp \
    -v "$FRONT_DIR:/app" \
    -w /app \
    "$FRONT_NODE_IMAGE" \
    sh -c "npm ci --no-audit --no-fund && npm run build"

  if [ ! -f "$FRONT_DIR/dist/index.html" ]; then
    echo "Frontend build did not produce dist/index.html"
    exit 1
  fi

  echo "Publishing frontend to $FRONT_PUBLISH_DIR"
  $SUDO rm -rf "$FRONT_PUBLISH_DIR.prev"
  if [ -d "$FRONT_PUBLISH_DIR" ]; then
    $SUDO cp -a "$FRONT_PUBLISH_DIR" "$FRONT_PUBLISH_DIR.prev"
  fi
  $SUDO mkdir -p "$FRONT_PUBLISH_DIR"
  $SUDO find "$FRONT_PUBLISH_DIR" -mindepth 1 -delete
  $SUDO cp -R "$FRONT_DIR/dist/." "$FRONT_PUBLISH_DIR/"
  $SUDO chmod -R a+rX "$FRONT_PUBLISH_DIR"
  echo "Frontend $FRONT_REV published (previous release: $FRONT_PUBLISH_DIR.prev)"
else
  echo "Skipping frontend deploy (set DEPLOY_FRONTEND=1 to build and publish ossi2.0-front)"
fi

if [ "${APPLY_NGINX_CONF:-0}" = "1" ]; then
  $SUDO install -m 644 "$NGINX_CONF_SRC" "$NGINX_CONF_DST"
  $SUDO nginx -t
  if command -v systemctl >/dev/null 2>&1; then
    $SUDO systemctl reload nginx
  else
    $SUDO service nginx reload
  fi
  echo "Nginx config applied: $NGINX_CONF_DST"
else
  echo "Skipping Nginx changes (set APPLY_NGINX_CONF=1 to apply $NGINX_CONF_SRC)"
fi

echo "Deploy completed for tag: $IMAGE_TAG"
