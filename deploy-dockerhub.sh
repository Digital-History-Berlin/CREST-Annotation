#!/bin/bash
#
# Build and push updated docker containers with release configuration
#
set -e

GIT_SHA=$(git rev-parse HEAD)

IMAGE="tapdo/crest-$1"

NGINX_CONF=nginx-no-auth.conf.template

echo Deploying version $VERSION

docker build -f crest-annotation-docker/$1/Dockerfile --network=host \
    --build-arg NGINX_CONF=$NGINX_CONF \
    -t $IMAGE:latest \
    -t $IMAGE:$GIT_SHA \
    .

docker push $IMAGE:latest
docker push $IMAGE:$GIT_SHA
