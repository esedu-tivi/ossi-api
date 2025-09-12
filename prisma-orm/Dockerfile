FROM node:22-alpine
WORKDIR /usr/prisma-orm/
COPY . .
RUN npm install
RUN npx prisma generate
CMD [ "npx", "tsc", "--build" ]
