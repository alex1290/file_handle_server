FROM node:14.18

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json ./

RUN yarn

COPY . .

CMD [ "yarn", "start" ]