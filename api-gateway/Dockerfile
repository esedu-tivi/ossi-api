# --- Build stage ---
FROM node:22-alpine AS build
WORKDIR /usr/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Runtime stage ---
FROM node:22-alpine
WORKDIR /usr/app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /usr/app/dist ./dist

EXPOSE 3000
CMD ["node", "./dist/index.js"]