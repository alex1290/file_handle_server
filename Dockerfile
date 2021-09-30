# Base image
FROM node:14.18
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN yarn install && yarn cache clean

# Bundle app source
COPY . /usr/src/app

CMD [ "yarn", "start" ]