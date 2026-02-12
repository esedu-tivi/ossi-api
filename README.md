# ossi-api

ossi-api

## Development usage

In order to run and develop the backend you must have installed:

- Container engine compatible with Docker, for example [Docker Desktop](https://www.docker.com/)
- Node.js compatible JavaScript runtime.

Note: If using Node.js, version 22.11.0 (latest LTS version currently) is recommended.

### Running the Application

#### Production

```bash
npm start
```

#### Development

```bash
npm install
npm --workspace=prisma-orm run build
```

```bash
npm run dev
```

#### Stop Running Containers

```bash
npm stop
```

#### Run Tests

```bash
npm test
```

> TODO: Make Express in student-management-api stop after tests

## Migrations

### Prisma

If you want sample data in the database, run seeds:

```
npm run seed
```

## Routes

Apollo Server: `localhost:3000/graphql`

Prisma Studio: `localhost:5555`

pgAdmin: `localhost:5433`
