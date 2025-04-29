#!/bin/bash
# Production deployment script for OSSI API

# Set up error handling and logging
set -e
LOGFILE="/var/log/ossi-deployment.log"
exec > >(tee -a $LOGFILE) 2>&1
echo "===== Deployment started at $(date) ====="

# Running pre-deployment checks
echo "🔍 Running pre-deployment checks..."
for cmd in docker npm node npx; do
  if ! command -v $cmd &> /dev/null; then
    echo "❌ $cmd command not found! Please install it first."
    exit 1
  fi
done

if ! docker info &> /dev/null; then
  echo "❌ Docker service is not running! Please start it first."
  exit 1
fi

# Bakcup current version
echo "📦 Backing up current version..."
BACKUP_DIR="/backup"
mkdir -p $BACKUP_DIR
PREVIOUS_VERSION_BACKUP="$BACKUP_DIR/ossi_previous_version_$(date +%Y%m%d_%H%M%S)"
mkdir -p $PREVIOUS_VERSION_BACKUP

# Poista vanhat varmuuskopiot (säilytä vain viimeiset 7)
echo "🧹 Cleaning up old backups..."
ls -t $BACKUP_DIR/ossi_db_*.sql 2>/dev/null | tail -n +8 | xargs -r rm

# Ota varmuuskopio nykyisestä versiosta
BACKUP_FILE="$BACKUP_DIR/ossi_db_$(date +%Y%m%d_%H%M%S).sql"
echo "📦 Creating database backup to $BACKUP_FILE..."
if docker compose ps | grep -q db; then
  docker compose exec -T db pg_dump -U postgres postgres > $BACKUP_FILE
  cp -r ./* $PREVIOUS_VERSION_BACKUP/
else
  echo "⚠️ Database container not running, skipping backup"
fi

# Käytä tuotannon env-tiedostoa
if [ -f "/etc/ossi-api/.env.production" ]; then
  echo "⚙️ Copying production .env file..."
  cp /etc/ossi-api/.env.production ./.env
fi

# Build sequelize-models
echo "📦 Building sequelize-models..."
cd sequelize-models/
rm -rf dist/
npm ci
# Make sure TypeScript is installed
if ! [ -d "node_modules/typescript" ]; then
  echo "Installing TypeScript..."
  npm ci typescript
fi
npx tsc --build
cd ..

# API-gateway setup
echo "🔧 Setting up API-gateway..."
cd api-gateway/
npm ci
cd ..

# Auth-api setup
echo "🔑 Setting up Auth-api..."
cd auth-api/
npm ci
cd ..

# Notification-server setup
echo "🔔 Setting up Notification-server..."
cd notification-server/
npm ci
cd ..

# Student-management-api setup
echo "👩‍🎓 Setting up Student-api..."
cd student-management-api/
npm ci
cd ..

# Down any existing containers but preserve database volumes
echo "🧹 Cleaning up existing containers..."
docker compose down

# Build and start containers
echo "🏗️ Building containers..."
docker compose build

# Run containers in detached mode (-d)
echo "🚀 Starting production environment..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Check container status
echo "🔍 Checking container status..."
sleep 10  # Give containers some time to start
if ! docker compose ps | grep -q "Up"; then
  echo "❌ Containers failed to start properly! Rolling back..."
  # Restore previous version
  cp -r $PREVIOUS_VERSION_BACKUP/* ./
  docker compose down
  docker compose up -d
  exit 1
fi

# Runnig database migrations
echo "📊 Running database migrations..."
if docker compose exec -T db-migrations node migrator up; then
  echo "✅ Migrations completed successfully"
else
  echo "❌ Migration failed! Rolling back..."
  # Rollback to previous version
  cp -r $PREVIOUS_VERSION_BACKUP/* ./
  docker compose down
  docker compose up -d
  exit 1
fi

# Check API health
echo "🔍 Checking API health..."
MAX_RETRIES=12
RETRY_INTERVAL=5
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if curl -s http://localhost:3000/health | grep -q "ok"; then
    echo "✅ API is responding correctly"
    break
  else
    echo "⏳ API not ready yet, retrying in $RETRY_INTERVAL seconds..."
    sleep $RETRY_INTERVAL
    RETRY_COUNT=$((RETRY_COUNT+1))
  fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ API health check failed after $MAX_RETRIES retries!"
  echo "Consider checking the logs and manual intervention"
fi

echo "✅ Production deployment completed successfully at $(date)"