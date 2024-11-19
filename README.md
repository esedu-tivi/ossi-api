# ossi-api
ossi-api

## Development usage
In order to run and develop the backend you must have installed:

* Container engine compatible with Docker, for example [Docker Desktop](https://www.docker.com/)
* Node.js compatible JavaScript runtime.

Note: If using Node.js, version 22.11.0 (latest LTS version currently) is recommended.

# Build and run
Within the directories `api-gateway`, `student-management-api` and `auth-api` run:
```
npm install
```

To run the entire project run:
```
docker compose build
docker compose up
```

The API is exposed through port 3000.
