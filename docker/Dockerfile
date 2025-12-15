FROM node:22-alpine AS base
RUN apk add --update dumb-init
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
ENV NODE_ENV=production
ARG SERVICE_NAME
WORKDIR /usr/app/

COPY ./package.json ./
COPY ./${SERVICE_NAME}/package.json ./${SERVICE_NAME}/
RUN npm install --omit=dev \
    && npm cache clean --force

# Dev container
FROM base AS dev
ENV NODE_ENV=development
ENV ws=${SERVICE_NAME}

RUN npm install
CMD ["npm", "--workspace", "${ws}", "run", "dev" ]


# Compile typescript sources
FROM dev AS build
ARG SERVICE_NAME
COPY ./${SERVICE_NAME} /usr/app/${SERVICE_NAME}
RUN npm -ws run build

# Production
FROM base AS final
ENV ws=${SERVICE_NAME}
WORKDIR /usr/app/
COPY --from=build --chown=node:node /usr/app/${SERVICE_NAME}/dist ./${SERVICE_NAME}/dist
USER node
CMD [ "npm", "--workspace", "${ws}", "start" ]
