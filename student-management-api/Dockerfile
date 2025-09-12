FROM node:22-alpine
WORKDIR /usr/server/
COPY --from=sequelize-models . ../sequelize-models/
COPY --from=prisma-orm . ../prisma-orm/
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
