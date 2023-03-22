FROM node:18-slim as build-stage

WORKDIR /app

# install only if package.json changes
COPY ./crest-annotation-web/package.json ./
RUN npm install

ARG NODE_ENV
ARG REACT_APP_BACKEND

COPY ./crest-annotation-web/ ./
RUN npm run build

FROM nginx:1.15

COPY ./crest-annotation-docker/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./crest-annotation-docker/web/.htpasswd /etc/nginx/.htpasswd

WORKDIR /usr/share/nginx/html/

COPY --from=build-stage /app/build/ ./
