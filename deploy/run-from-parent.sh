#!/usr/bin/env sh
set -eu

# Wrapper for server layout:
# /srv/ossi2/.deploy.env
# /srv/ossi2/ossi-api
#
# By default, infer paths from this file location:
# script:   /srv/ossi2/ossi-api/deploy/run-from-parent.sh
# APP_DIR:  /srv/ossi2/ossi-api
# PARENT:   /srv/ossi2

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
APP_DIR="${APP_DIR:-$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)}"
PARENT_DIR="${PARENT_DIR:-$(CDPATH= cd -- "$APP_DIR/.." && pwd)}"
DEPLOY_ENV_FILE="${DEPLOY_ENV_FILE:-$PARENT_DIR/.deploy.env}"
DEPLOY_SCRIPT="${DEPLOY_SCRIPT:-$APP_DIR/deploy/deploy-on-server.sh}"

if [ ! -d "$APP_DIR" ]; then
  echo "Missing APP_DIR: $APP_DIR"
  exit 1
fi

if [ ! -f "$DEPLOY_ENV_FILE" ]; then
  echo "Missing DEPLOY_ENV_FILE: $DEPLOY_ENV_FILE"
  exit 1
fi

if [ ! -x "$DEPLOY_SCRIPT" ]; then
  echo "Missing executable deploy script: $DEPLOY_SCRIPT"
  exit 1
fi

set -a
. "$DEPLOY_ENV_FILE"
set +a

cd "$APP_DIR"
exec "$DEPLOY_SCRIPT"
