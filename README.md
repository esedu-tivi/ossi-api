# ossi-api

ossi-api

## Development usage

In order to run and develop the backend you must have installed:

- Container engine compatible with Docker, for example [Docker Desktop](https://www.docker.com/)
- Node.js compatible JavaScript runtime.

Note: If using Node.js, version 22.11.0 (latest LTS version currently) is recommended.

## 1. Installation

### 1.1 Dependencies

```
npm install
```

### 1.2 Generate prisma

```
npm --workspace=prisma-orm run build
```

### 1.3 Run

production

```
npm start
```

dev

```
npm run dev
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

## 2. Migrations

### 2.1 Prisma

If you want sample data in the database, run seeds:

```
npm run seed
```

## 3. Routes

Apollo Server: `localhost:3000/graphql`

Prisma Studio: `localhost:5555`

pgAdmin: `localhost:5433`
