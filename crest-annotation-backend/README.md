# Backend for CREST annotation tool

Backend for CREST annotation tool based on FastAPI and PostgreSQL with SQLalchemy.

## Running the backend (Linux)

Following steps are currently required to setup the project:

1. Setup python virtual environment
1. **From your virtual environment** install requirements using `pip3 install -r requirements.txt`
1. Bring up the database (from `../crest-annotation-docker` run `docker compose up -d db`)

Subsequently `uvicorn app.main:app` will bring up the backend at port 8000. Note that on the first run, SQLalchemy will implicitly create all tables.

## Access the database

To access the database use the `psql` client with `psql -h localhost -U <user>`. Have a look at the `docker-compose.yaml` for the credentials.

### Creating a new project

```
INSERT INTO projects (id, name, source) VALUES ('<project-uuid>', '<project-name>', '<image-path>');
```

### Creating labels

```
INSERT INTO labels (id, project_id, name) VALUES ('<uuid>', '<project-uuid>', '<label>');
```

## Collecting images

To update the images in the database enter the virtual environment follow these steps:

1. Add images to `../database` folder (create it if it does not yet exist)
1. Collect all images by sending a GET to `localhost:8000/objects/collect/085d2619-ec1a-4d2e-b6fd-0bdd949c2c3c`

## OpenAPI

To generate the API specification under `../crest-annitation-openapi` enter the virtual environment and run:

```
python3 generate_openapi.py
```

With the backend running, the OpenAPI documentation can be viewed at `localhost:8000/docs#`.
