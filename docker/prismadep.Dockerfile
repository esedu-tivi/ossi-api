FROM node:22-alpine AS base
RUN apk add --update dumb-init
ARG SERVICE_NAME
ENV NODE_ENV=production
WORKDIR /usr/app

COPY ./package.json ./
COPY ./${SERVICE_NAME}/package.json ./${SERVICE_NAME}/
RUN --mount=type=cache,target=/app/node_modules \
    --mount=type=cache,target=/root/.npm \
    npm install --omit=dev

# --- Prisma stage ---
FROM base AS prisma
WORKDIR /usr/app
COPY --from=prisma-orm --chown=node:node /usr/app/node_modules ./node_modules
COPY --from=prisma-orm --chown=node:node /usr/app/prisma-orm ./prisma-orm

# --- Dev container ---
FROM prisma AS dev
ENV NODE_ENV=development
ARG SERVICE_NAME
ENV ws=${SERVICE_NAME}
RUN --mount=type=cache,target=/app/node_modules \
    --mount=type=cache,target=/root/.npm \
    npm install --workspace=${ws}
CMD ["npm", "--workspace", "${ws}", "run", "dev"]

# --- Build stage ---
FROM dev AS build
ARG SERVICE_NAME
WORKDIR /usr/app
ENV ws=${SERVICE_NAME}
COPY ./${SERVICE_NAME} ./${SERVICE_NAME}/
RUN npm run -w ${SERVICE_NAME} build

# --- Production ---
FROM base AS final
ARG SERVICE_NAME
ENV ws=${SERVICE_NAME}
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
USER node
WORKDIR /usr/app

RUN npm cache clean --force
COPY --from=prisma-orm --chown=node:node /usr/app/node_modules ./node_modules
COPY --from=build --chown=node:node /usr/app/prisma-orm/dist ./prisma-orm/dist
COPY --from=build --chown=node:node /usr/app/prisma-orm/package.json ./prisma-orm/
COPY --from=build --chown=node:node /usr/app/${SERVICE_NAME}/dist ./${SERVICE_NAME}/dist

CMD [ "npm", "--workspace", "${ws}", "run", "start" ]
