FROM node:22-alpine
WORKDIR /usr/sequelize-models/
COPY . .
RUN npm install
CMD ["tsc", "--build"]
