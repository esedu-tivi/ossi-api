######### First Stage #############

FROM node:22-alpine AS dev

WORKDIR /app

COPY --chown=node:node . .

RUN npm install \
    && npm run build \
    && npm prune --omit=dev

######### Second Stage #############

FROM node:22-alpine AS production

WORKDIR /app

# Create the necessary directories with correct permissions
COPY --chown=node:node --from=dev /app/node_modules ./node_modules
COPY --chown=node:node --from=dev /app/prisma/schema.prisma ./schema.prisma
COPY --chown=node:node --from=dev /app/prisma/migrations ./migrations
COPY --chown=node:node --from=dev /app/dist ./dist
COPY --chown=node:node --from=dev /app/package*.json ./

# Switch to the non-root user
# USER node

CMD ["node", "dist/src/index"]
