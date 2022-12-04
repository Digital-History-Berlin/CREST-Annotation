# CREST annotation tool

This folder provides a compose file to run and deploy the application.

## Local deployment

Simply bring up all services using `docker compose up -d`. The frontend is now served to `localhost`.

## AWS

The application is deployed to AWS using [ECS](https://eu-central-1.console.aws.amazon.com/ecs/home?region=eu-central-1#/clusters).

### Update Docker images

The custom docker images for `backend` and `web` service are stored in a private repository on [ECR](https://eu-central-1.console.aws.amazon.com/ecr/repositories?region=eu-central-1).

- To update the repositories use, you need authenticate your docker first (valid for 24 hours).

```
aws ecr get-login-password --region eu-central-1 | /usr/local/bin/docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.eu-central-1.amazonaws.com
```

- Build the docker images

```
docker compose build backend
docker compose build web
```

- Tag the image with the corresponding repository

```
docker tag crest-annotation-docker-backend <aws_account_id>.dkr.ecr.eu-central-1.amazonaws.com/crest-backend
docker tag crest-annotation-docker-web <aws_account_id>.dkr.ecr.eu-central-1.amazonaws.com/crest-web
```

- Push the image to the corresponding repository

```
docker push <aws_account_id>.dkr.ecr.eu-central-1.amazonaws.com/crest-backend
docker push <aws_account_id>.dkr.ecr.eu-central-1.amazonaws.com/crest-web
```

### Deployment

You need to have the AWS CLI installed and configured.

You need to create an ECS docker context.

- Create the ECS docker context `docker context create ecs crest-ecs`

_NOTE:_ If you have trouble with the Docker CLI under Ubuntu, it might be neccessary to install the Docker Compose CLI preview (see https://stackoverflow.com/questions/67236401/docker-context-create-ecs-myecs-requires-exactly-one-argument/67236402#67236402) alongside with your existing CLI under `/usr/local/bin/docker`.

```
curl -L https://raw.githubusercontent.com/docker/compose-cli/main/scripts/install/install_linux.sh | sh
```

Now you should use `/usr/local/bin/docker` instead of `docker` for all subsequent commands.

Deployment to AWS is done using ECS (following https://docs.docker.com/cloud/ecs-integration/).

- Use the context with `docker context use crest-ecs`
- Bring up the containers using the AWS specific overrides `docker compose -f docker-compose.yaml -f docker-compose.aws.yaml up`
- You can use other docker commands in the same way (i.e. `docker compose -f docker-compose.yaml -f docker-compose.aws.yaml logs`)
- Once done switch back to `default` context with `docker context use default`

This will build and configure all required AWS services. Since this is a rolling release, it will take some time for the changes to take effect, during which the previous versions of the services are still served. You can check the deployment status for each _service_ in ECS under the _Deployment_ tab.
