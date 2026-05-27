FROM node

ENV MONGO_DB_USERNAME=admin \
    MONGO_DB_PW=admin

WORKDIR /saarthi/app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["node", "server.js"]