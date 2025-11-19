#!/usr/bin/env bash

if command -v docker compose >/dev/null; then
  docker_compose='docker compose'
elif command -v podman --version >/dev/null; then
  docker_compose='podman compose'
elif command -v podman-compose -v >/dev/null; then
  docker_compose='podman-compose'
else
  echo no docker- or podman compose found...
  exit
fi


if [ ! -d "./prisma-orm/dist" ]; then
(
   echo 'generating prisma-orm'
   cd prisma-orm || exit
   npm run build
)
fi

echo '(Re)building Containers and (Re)starting them.'
$docker_compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

printf "\nTo view logs do either one: \n\t $docker_compose logs -f \n\t $docker_compose logs -f container_name\n"
