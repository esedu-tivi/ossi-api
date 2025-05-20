# ossi-api
ossi-api

## Development usage
In order to run and develop the backend you must have installed:

* Container engine compatible with Docker, for example [Docker Desktop](https://www.docker.com/)
* Node.js compatible JavaScript runtime.

Note: If using Node.js, version 22.11.0 (latest LTS version currently) is recommended.

# Build and run
Within the directories `api-gateway`, `student-management-api`, `notification-server`, `messaging-server` and `auth-api` run:
```
npm install
```

Within the `sequelize-models` directory run:
```
tsc --build
```

To run the entire project run:
```
docker compose build
docker compose up
```

The API is exposed through port 3000.

## Migrations

Migrations are run automatically when running `docker compose up`. To migrate down, run:
```
docker compose run --rm db-migrations node migrator down
```
To run other [commands](https://github.com/sequelize/umzug?tab=readme-ov-file#cli-usage), run:
```
docker compose run --rm db-migrations node migrator <command>
```
If you want sample data in the database, run seeds:
```
docker compose run --rm db-migrations node seeder up
```
