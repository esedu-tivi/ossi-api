FROM node:22-alpine AS build
WORKDIR /usr/app
COPY package.json ./
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
COPY generated ./generated
COPY prisma.config.ts ./
RUN npm install
RUN npm run build

FROM node:22-alpine AS prod
WORKDIR /usr/app
COPY package.json ./
RUN npm install --omit=dev
COPY --from=build /usr/app/dist ./dist
COPY --from=build /usr/app/prisma ./prisma
COPY --from=build /usr/app/generated ./generated
COPY --from=build /usr/app/prisma.config.ts ./
CMD ["npm", "start"]