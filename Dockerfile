FROM node:5.5.0

MAINTAINER Go About <tech@goabout.com>

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /usr/src/app && cp -a /tmp/node_modules /usr/src/app

# From here we load our application's code in, therefore the previous docker
# "layer" thats been cached will be used if possible
WORKDIR /usr/src/app
ADD . /usr/src/app

ENV PORT=80

EXPOSE 80

CMD [ "npm", "start" ]
