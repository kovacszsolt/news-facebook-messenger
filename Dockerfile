FROM alpine:3.8
RUN apk add --update nodejs nodejs-npm
COPY ./ /home/node/app
WORKDIR /home/node/app
EXPOSE 1400
RUN npm install
CMD node ./app.js
