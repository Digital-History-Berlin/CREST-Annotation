# CREST annotation tool

This folder provides a docker compose setup to run and deploy the application. It includes the PostgreSQL database as `db`, the FastAPI backend as `backend` and the React frontend as `web`.

## Local deployment

Simply bring up all services using `docker compose up -d`. The frontend is now served to `localhost` with the backend at `localhost/api`.

### Access the database

To access the database use the `psql` client with `psql -h localhost -U <user>`. Have a look at the `docker-compose.yaml` for the credentials.

## AWS

The application is deployed to AWS using [ECS](https://eu-central-1.console.aws.amazon.com/ecs/home?region=eu-central-1#/clusters).

### Prequisites

- You need to have the AWS CLI installed and configured.
- You need to create an ECS docker context with `docker context create ecs crest-ecs`.

  _NOTE:_ If you have trouble with the Docker CLI under Ubuntu, it might be neccessary to install the Docker Compose CLI preview (see https://stackoverflow.com/questions/67236401/docker-context-create-ecs-myecs-requires-exactly-one-argument/67236402#67236402) alongside with your existing CLI under `/usr/local/bin/docker`.

      curl -L https://raw.githubusercontent.com/docker/compose-cli/main/scripts/install/install_linux.sh | sh

  Now you should use `/usr/local/bin/docker` instead of `docker` for all subsequent commands.

- You need to authenticate the docker CLI (valid for 24 hours).

      aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.eu-central-1.amazonaws.com

### Docker images

The custom docker images for `backend` and `web` service are stored in a private repository on [ECR](https://eu-central-1.console.aws.amazon.com/ecr/repositories?region=eu-central-1).

_The images must be build and pushed from the `default` context._

- Build the docker images

      docker compose build backend
      docker compose build web

- Tag the images with the corresponding repository

      docker tag crest-annotation-docker-backend <aws_account_id>.dkr.ecr.eu-central-1.amazonaws.com/crest-backend
      docker tag crest-annotation-docker-web <aws_account_id>.dkr.ecr.eu-central-1.amazonaws.com/crest-web

- Push the images to the corresponding repository

      docker push <aws_account_id>.dkr.ecr.eu-central-1.amazonaws.com/crest-backend
      docker push <aws_account_id>.dkr.ecr.eu-central-1.amazonaws.com/crest-web

### Deployment

## CI

Changes to the `develop` branch will automatically be deployed.

_NOTE_: Currently the CI deployment will update the backend and web images on ECR and force a reload on ECS. However, changes to the docker composition itself will not be reflected and need to be deployed manually.

## Manual deployment

Deployment to AWS ECS can be done manually following https://docs.docker.com/cloud/ecs-integration/.

- Switch to the `crest-ecs` context with `docker context use crest-ecs`.
- Deploy the changes using the AWS specific overrides with `docker compose -f docker-compose.yaml -f docker-compose.aws.yaml up`. Since this is a rolling release, it will take some time for the changes to take effect, during which the previous versions of the services are still served. You can check the deployment status for each _service_ in ECS under the _Deployment_ tab. Currently the web service is updated _after_ the backend service update is complete. This can lead to a short period of time, where the frontend is unable to access the backend, because it is uses an outdated ip address.
- Switch back to the `default` context with `docker context use default`.
