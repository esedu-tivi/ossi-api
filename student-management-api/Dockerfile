FROM node:22-alpine AS build
WORKDIR /usr/app

COPY package.json package-lock.json ./
COPY student-management-api/package.json ./student-management-api/package.json
RUN npm ci -w student-management-api

COPY student-management-api ./student-management-api
RUN npm run build -w student-management-api

FROM node:22-alpine
WORKDIR /usr/app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY student-management-api/package.json ./student-management-api/package.json
RUN npm ci --omit=dev -w student-management-api

COPY --from=build /usr/app/student-management-api/dist ./student-management-api/dist

EXPOSE 3000
CMD ["node", "./student-management-api/dist/index.js"]