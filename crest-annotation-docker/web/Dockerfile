FROM node:16 as build-stage

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
ARG REACT_APP_BACKEND
ENV REACT_APP_BACKEND $REACT_APP_BACKEND

WORKDIR /app

COPY ./crest-annotation-web/package.json ./
RUN npm install

COPY ./crest-annotation-web/ /app
RUN npm run build

FROM nginx:1.15

COPY ./crest-annotation-docker/web/nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html/

COPY --from=build-stage /app/build/ ./
COPY ./crest-annotation-docker/web/env.sh ./
COPY ./crest-annotation-web/.env.local ./.env

# inject environment variables and run
CMD ["/bin/bash", "-c", "./env.sh && nginx -g \"daemon off;\""]
