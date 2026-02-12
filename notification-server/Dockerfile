FROM node:22-alpine AS build
WORKDIR /usr/app

COPY package.json package-lock.json ./
COPY notification-server/package.json ./notification-server/package.json
RUN npm ci -w notification-server

COPY notification-server ./notification-server
RUN npm run build -w notification-server

FROM node:22-alpine
WORKDIR /usr/app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY notification-server/package.json ./notification-server/package.json
RUN npm ci --omit=dev -w notification-server

COPY --from=build /usr/app/notification-server/dist ./notification-server/dist

EXPOSE 3000
CMD ["node", "./notification-server/dist/index.js"]