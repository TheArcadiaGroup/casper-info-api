FROM node:16.16.0-alpine
WORKDIR /src
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["node","dist/app.js"]