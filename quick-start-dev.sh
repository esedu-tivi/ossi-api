#!/usr/bin/env bash

(
  echo '(Re)generating sequelize-models'
  cd sequelize-models || exit
  rm -rf dist/
  npm run compile
)

echo '(Re)building Containers and (Re)starting them.'
docker compose -f docker-compose.dev.yml up -d --build

printf '
to view logs do either one: 
  docker compose logs
  docker compose -f [container name]
'
