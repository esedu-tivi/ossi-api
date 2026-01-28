FROM node:22-alpine
WORKDIR /usr/app
COPY package.json .
RUN npm install --omit=dev
COPY . .
RUN npm run build
CMD ["npm", "start"]