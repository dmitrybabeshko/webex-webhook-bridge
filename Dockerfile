FROM node:lts-alpine

LABEL maintainer="Dmytro Babeshko"

ENV WEBEX_TOKEN=""
ENV WEBEX_WEBHOOK_HOST=""
ENV WEBEX_WEBHOOK_PORT=""
ENV WEBEX_KAFKA_TOPIC=""
ENV WEBEX_KAFKA_CLIENT=""
ENV WEBEX_KAFKA_BROKERS=""

WORKDIR /usr/src/app

COPY . ./

RUN npm install --scripts-prepend-node-path=auto

CMD node --unhandled-rejections=none app.js
