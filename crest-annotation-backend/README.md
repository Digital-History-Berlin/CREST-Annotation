# Backend for CREST annotation tool

Backend for CREST annotation tool based on FastAPI and PostgreSQL with SQLalchemy.

## Running the backend

Following steps are currently required to setup the project:

1. Setup python virtual environment
1. **From your virtual environment** install requirements using `pip3 install -r requirements.txt`
1. Bring up the database (from `../crest-annotation-docker` run `docker compose up -d db`)
1. _From your virtual environment_ migrate the database to the most recent version `alembic upgrade head`

Subsequently `uvicorn app.main:app` will bring up the backend at port 8000.

Whenever the database revision changes it needs to be migrated again.

## OpenAPI

The API specification is stored under `../crest-annotation-openapi/openapi.json`.

To generate the API specification enter the virtual environment and run:

```
python3 generate_openapi.py
```

With the backend running, the OpenAPI documentation can be viewed at `localhost:8000/docs#`.

## Alembic

Database versioning and migration is done using Alembic. Whenever a database model is changed, a new migration needs to be created:

1. Database must be running and up to date
1. From the virtual environment run `alembic revision --autogenerate -m "<commit message>"`

This will auto-generate a migration file. Now `alembic upgrade head` will apply these changes to any database.

To do this on a remote instance, a quick and easy solution is to edit `.env.local`.
