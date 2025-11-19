FROM node:22-alpine AS base
RUN apk add --update dumb-init
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev \
    && npm cache clean --force

# Dev container
FROM base AS dev
ENV NODE_ENV=development
ENV DEBUG=*
RUN npm install
CMD ["npm", "run", "dev"]

# Compile typescript sources
FROM dev AS build
COPY . .
COPY --from=prisma-orm /app ../prisma-orm
RUN npm run compile

FROM base AS final
COPY --from=prisma-orm /app ../prisma-orm
COPY --from=build --chown=node:node /app/dist/ ./dist
USER node
CMD [ "npm", "start" ]
