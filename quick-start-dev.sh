cd sequelize-models/ \
    ; rm -rf dist/ \
    ; tsc --build \
    ; cd .. \
    ; podman compose down \
    ; podman compose down -v \
    ; podman compose build \
    ; podman compose up
