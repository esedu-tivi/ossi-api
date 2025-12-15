######### First Stage #############

FROM node:22-alpine AS dev
ARG SERVICE_NAME
WORKDIR /usr/app/

COPY ./package.json ./
COPY ./${SERVICE_NAME} ./${SERVICE_NAME}/
RUN npm install \
    && npm -ws run build

######### Second Stage #############
#
FROM dev AS prune
ARG SERVICE_NAME
WORKDIR /usr/app/${SERVICE_NAME}
RUN npm prune --omit=dev

######### Third Stage #############
#
FROM node:22-alpine AS final
ARG SERVICE_NAME
ENV workdir=/usr/app/${SERVICE_NAME}
WORKDIR ${workdir}

# Create the necessary directories with correct permissions
COPY --chown=node:node --from=prune /usr/app/package.json ../
COPY --chown=node:node --from=prune /usr/app/node_modules ../node_modules

COPY --chown=node:node --from=prune ${workdir}/prisma/schema.prisma ./prisma/schema.prisma
COPY --chown=node:node --from=prune ${workdir}/prisma/migrations ./prisma/migrations
COPY --chown=node:node --from=prune ${workdir}/dist ./dist
COPY --chown=node:node --from=prune ${workdir}/package*.json ./
COPY --chown=node:node --from=prune ${workdir}/dist/prisma.config.js ./
RUN mkdir generated && chown node:node generated

# Switch to the non-root user
USER node

CMD [ "npm", "--workspace", "${ws}", "start" ]

