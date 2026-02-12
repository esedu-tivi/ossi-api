FROM node:22-alpine AS build
WORKDIR /usr/app

COPY package.json package-lock.json ./
COPY prisma-orm/package.json ./prisma-orm/package.json
COPY messaging-server/package.json ./messaging-server/package.json

RUN npm ci -w prisma-orm -w messaging-server

COPY prisma-orm ./prisma-orm
COPY messaging-server ./messaging-server

RUN npm run build -w prisma-orm
RUN npm run build -w messaging-server

FROM node:22-alpine
WORKDIR /usr/app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY prisma-orm/package.json ./prisma-orm/package.json
COPY messaging-server/package.json ./messaging-server/package.json

RUN npm ci --omit=dev -w prisma-orm -w messaging-server

COPY --from=build /usr/app/prisma-orm/dist ./prisma-orm/dist
COPY --from=build /usr/app/messaging-server/dist ./messaging-server/dist

EXPOSE 3000
CMD ["node", "./messaging-server/dist/index.js"]