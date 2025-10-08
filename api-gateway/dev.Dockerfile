FROM node:24.9-alpine
WORKDIR /usr/server/
COPY . .
RUN npm install
ENV NODE_ENV development
EXPOSE 3000
CMD ["npm", "run", "dev"]
