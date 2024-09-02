ARG NODE_VERSION=20.12.2

FROM node:${NODE_VERSION}-alpine

RUN mkdir /proboto
WORKDIR /proboto
COPY . /proboto

#ensure node-gyp support
RUN apk add --update python3 make g++ build-base cairo-dev jpeg-dev pango-dev giflib-dev \
   && rm -rf /var/cache/apk/*

RUN npm install
RUN npm run deploy
CMD npm start