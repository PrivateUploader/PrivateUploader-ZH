# syntax=docker/dockerfile:1

FROM node:18-alpine
RUN apk update && apk add git
WORKDIR /app
COPY . .
RUN yarn install --frozen-lockfile
RUN yarn build
WORKDIR /app/frontend
RUN yarn install --frozen-lockfile
RUN yarn build
WORKDIR /app
CMD ["node", "out/cluster.js"]
EXPOSE 34582