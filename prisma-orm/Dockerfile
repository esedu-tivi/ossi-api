FROM node:22-alpine AS build
WORKDIR /usr/app

# Root workspace metadata + lock
COPY package.json package-lock.json ./
COPY prisma-orm/package.json ./prisma-orm/package.json

# Asenna workspacen deps (sis. dev), jotta prisma CLI löytyy
RUN npm ci -w prisma-orm

# Kopioi lähdekoodi
COPY prisma-orm ./prisma-orm

# Build tekee: prisma generate + tsc (teidän scripts.build)
RUN npm run build -w prisma-orm

# Runtime: migraatiot/generate vaatii prisma CLIn → EI omit=dev
FROM node:22-alpine
WORKDIR /usr/app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY prisma-orm/package.json ./prisma-orm/package.json
RUN npm ci -w prisma-orm

# Tarvitaan sekä dist että prisma-kansio (schema + migrations + seed)
COPY --from=build /usr/app/prisma-orm/dist ./prisma-orm/dist
COPY --from=build /usr/app/prisma-orm/prisma ./prisma-orm/prisma
COPY --from=build /usr/app/prisma-orm/prisma.config.ts ./prisma-orm/prisma.config.ts

# Ei CMD:tä pakolla – compose antaa komennon (migrate/seed/studio)