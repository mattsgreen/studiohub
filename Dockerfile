FROM node:wheezy

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install
RUN ln -snf /usr/share/zoneinfo/Europe/London /etc/localtime && echo Europe/London > /etc/timezone

# Bundle app source
COPY . /usr/src/app

EXPOSE 82
CMD [ "node", "server.js" ]