#!/bin/bash
# Improved development environment script for OSSI API

# Set up error handling
set -e

echo "🔨 Setting up OSSI API development environment..."

# Build sequelize-models
echo "📦 Building sequelize-models..."
cd sequelize-models/
rm -rf dist/
npm install
# Make sure TypeScript is installed
if ! [ -d "node_modules/typescript" ]; then
  echo "Installing TypeScript..."
  npm install --save-dev typescript
fi
npx tsc --build
cd ..

# API-gateway setup
echo "🔧 Setting up API-gateway..."
cd api-gateway/
npm install
cd ..

# Auth-api setup
echo "🔑 Setting up Auth-api..."
cd auth-api/
npm install
cd ..

# Notication-server setup
echo "🔔 Setting up Notification-server..."
cd notification-server/
npm install
cd ..

# Student-management-api setup
echo "👩‍🎓 Setting up Student-api..."
cd student-management-api/
npm install
cd ..

# Down any existing containers and volumes
echo "🧹 Cleaning up existing containers and volumes..."
docker compose down
docker compose down -v

# Build and start containers
echo "🏗️ Building containers..."
docker compose build

echo "🚀 Starting development environment..."
docker compose up