FROM node:22-alpine AS base
RUN apk add --update dumb-init
USER node
WORKDIR /usr/server
COPY --from=sequelize-models . ../sequelize-models/
COPY --chown=node:node package*.json ./
RUN npm install

# Dev container
FROM base AS dev
WORKDIR /usr/server
ENV NODE_ENV development
COPY --chown=node:node tsconfig.json tsconfig.json
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["npm", "run", "dev"]

# Install production dependencies only
FROM node:22-alpine AS deps
USER node
WORKDIR /usr/server
COPY --chown=node:node package*.json ./
RUN npm install --omit=dev

# Compile typescript sources
FROM base AS build
USER node
WORKDIR /usr/server
COPY --chown=node:node tsconfig.json tsconfig.json
COPY --chown=node:node src/ src/
COPY --chown=node:node test/ test/
RUN npm run compile

# Combine production only node_modules with compiled javascript files.
FROM node:22-alpine AS final
RUN apk add --update dumb-init
USER node
WORKDIR /usr/server
COPY --chown=node:node --from=deps /usr/server/node_modules ./node_modules/
COPY --chown=node:node --from=build /usr/server/dist/ ./dist/
COPY --chown=node:node --from=build /usr/server/package*.json ./
COPY --from=sequelize-models . ../sequelize-models/
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD [ "npm", "start" ]
