# ossi-api

ossi-api

## Development usage

In order to run and develop the backend you must have installed:

- Container engine compatible with Docker, for example [Docker Desktop](https://www.docker.com/)
- Node.js compatible JavaScript runtime.

Note: If using Node.js, version 22.11.0 (latest LTS version currently) is recommended.

## 1. Installation

### 1.1 dependencies

```
npm install
```

> [!IMPORTANT]
> Current implementation requires that **prisma-orm/** contains **dist/** built via `npm run build`
>
> `npm install` script should handle this on unix-likes

### 1.2 Run

production

```
npm start
```

dev

```
npm run start:dev
```

stop running containers

```
npm stop
```

tests

```
npm test
```

> todo: make express in student-management-api stop after tests

> [!NOTE]
> The API is exposed through port 3000.

## 2. Migrations

### 2.1 Prisma

If you want sample data in the database, run seeds:

```
npm run seed
```

... todo ...

### 2.2 Sequelize

> [!CAUTION]
> Sequelize is no longer used

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
