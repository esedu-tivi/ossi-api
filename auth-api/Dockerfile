FROM node:22-alpine AS build
WORKDIR /usr/app

COPY package.json package-lock.json ./
COPY auth-api/package.json ./auth-api/package.json
RUN npm ci -w auth-api

COPY auth-api ./auth-api
RUN npm run build -w auth-api

FROM node:22-alpine
WORKDIR /usr/app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY auth-api/package.json ./auth-api/package.json
RUN npm ci --omit=dev -w auth-api

COPY --from=build /usr/app/auth-api/dist ./auth-api/dist

EXPOSE 3000
CMD ["node", "./auth-api/dist/index.js"]