FROM node:latest
EXPOSE 2020
WORKDIR /app
COPY ./package.json /app
RUN npm install
COPY ./ /app

#docker build -t trademind_socketio:minerpunk .
