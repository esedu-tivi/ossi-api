FROM node:22-alpine AS build
WORKDIR /usr/app

# Root metadata + lock
COPY package.json package-lock.json ./

# Workspace package.jsonit (minimi, jotta npm voi laskea depsit)
COPY prisma-orm/package.json ./prisma-orm/package.json
COPY auth-api/package.json ./auth-api/package.json

# Asenna depsit molemmille (prisma-orm tarvitaan buildin tyyppien takia)
RUN npm ci -w prisma-orm -w auth-api

# Kopioi lähdekoodi
COPY prisma-orm ./prisma-orm
COPY auth-api ./auth-api

# Buildaa prisma-orm ensin (tuottaa dist/types), sitten auth-api
RUN npm run build -w prisma-orm
RUN npm run build -w auth-api

FROM node:22-alpine
WORKDIR /usr/app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY prisma-orm/package.json ./prisma-orm/package.json
COPY auth-api/package.json ./auth-api/package.json

# Runtime: auth-api ei tarvitse prisma CLI:tä → omit=dev ok
RUN npm ci --omit=dev -w prisma-orm -w auth-api

# Kopioi runtimeen vain tarvittavat build-outputit
COPY --from=build /usr/app/prisma-orm/dist ./prisma-orm/dist
COPY --from=build /usr/app/auth-api/dist ./auth-api/dist

EXPOSE 3000
CMD ["node", "./auth-api/dist/index.js"]