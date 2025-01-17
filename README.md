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

## Environment variables
```
JWT_SECRET_KEY=secretkey
INTERNAL_AUTH_API_URL=http://authapi:3000
INTERNAL_STUDENT_MANAGEMENT_API_URL=http://studentmanagementapi:3000
INTERNAL_NOTIFICATION_SERVER_URL=http://notificationserver:3000
INTERNAL_MESSAGING_SERVER_URL=http://messagingserver:3000

INTERNAL_DB_HOSTNAME=db
INTERNAL_DB_PORT=5433
INTERNAL_DB_USERNAME=postgres
INTERNAL_DB_PASSWORD=postgres
INTERNAL_DB_DATABASE=postgres
```
