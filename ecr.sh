#!/bin/bash
#
# Helper script to build and push docker image to ECR
#
# Usage: AWS_ACCOUNT_ID=<account> ./ecr.sh [web|backend]
#

GIT_SHA=$(git rev-parse HEAD)

aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.eu-central-1.amazonaws.com

docker build -f crest-annotation-docker/$1/Dockerfile \
    -t $AWS_ACCOUNT_ID.dkr.ecr.eu-central-1.amazonaws.com/crest-$1:latest \
    -t $AWS_ACCOUNT_ID.dkr.ecr.eu-central-1.amazonaws.com/crest-$1:$GIT_SHA \
    -t $1 \
    .

docker push $AWS_ACCOUNT_ID.dkr.ecr.eu-central-1.amazonaws.com/crest-$1:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.eu-central-1.amazonaws.com/crest-$1:$GIT_SHA

# force service restart
if [ $SERVICE_ID ]; then
    aws ecs update-service --force-new-deployment --service crest-annotation-docker-$SERVICE_ID --cluster crest-annotation-docker
fi