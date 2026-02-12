# --- Build stage ---
FROM node:22-alpine AS build
WORKDIR /usr/app

# Kopioi workspace-root metadata + lock
COPY package.json package-lock.json ./

# Kopioi vain workspace package.jsonit, jotta npm osaa workspace-graafin
COPY api-gateway/package.json ./api-gateway/package.json

# Asenna vain tämän workspacen deps deterministisesti
RUN npm ci -w api-gateway

# Kopioi lähdekoodi ja buildaa workspace
COPY api-gateway ./api-gateway
RUN npm run build -w api-gateway

# --- Runtime stage ---
FROM node:22-alpine
WORKDIR /usr/app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY api-gateway/package.json ./api-gateway/package.json
RUN npm ci --omit=dev -w api-gateway

# Kopioi build-output
COPY --from=build /usr/app/api-gateway/dist ./api-gateway/dist

EXPOSE 3000
CMD ["node", "./api-gateway/dist/index.js"]