# Backend for CREST annotation tool

Backend for CREST annotation tool based on FastAPI and SQlite with SQLalchemy.

## Running the backend (Linux)

Following steps are currently required to setup the project:

1. Install sqlite on your local system (`sqlite3` command must be available)
1. Setup python virtual environment
1. **From your virtual environment** install requirements using `pip3 install -r requirements.txt`
1. Setup database with `sqlite3 crest.db` (`.exit` to leave)

Subsequently `uvicorn app.main:app` will bring up the backend at port 8000.

## Creating a new project

To create a project enter the SQlite command line (`sqlite3 crest.db`) and run:

```
INSERT INTO projects (id, name, source) VALUES ('085d2619-ec1a-4d2e-b6fd-0bdd949c2c3c', 'Test project', '../database');
```

## Creating labels

To create labels enter the SQlite command line (`sqlite3 crest.db`) and run:

```
INSERT INTO labels (id, project_id, name) VALUES ('<uuid>', '085d2619-ec1a-4d2e-b6fd-0bdd949c2c3c', '<label>');
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
