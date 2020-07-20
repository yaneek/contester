FROM node:10.20-alpine as builder
# add build tools (node-gyp related)
RUN apk add --no-cache make gcc g++ python

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY package.json server.js yarn.lock ./
RUN yarn install --production && yarn cache clean
# ------------------------------------------------------
FROM mhart/alpine-node:slim-10
ENV PORT 8080
EXPOSE $PORT
ENV NODE_ENV production

RUN adduser -D contest
USER contest

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app .

CMD [ "node", "server.js" ]
