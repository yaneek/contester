FROM node:20.17-alpine as builder
# add build tools (node-gyp related)
RUN apk add --no-cache make gcc g++ python3

ENV NODE_ENV production

WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install --production && yarn cache clean

COPY server.js  ./
# ------------------------------------------------------
FROM node:20.17-alpine
ENV PORT 8080
EXPOSE $PORT
ENV NODE_ENV production

USER node

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app .

CMD [ "node", "server.js" ]
