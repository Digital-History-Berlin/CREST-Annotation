# Backend for CREST annotation tool

Backend for CREST annotation tool based on FastAPI and PostgreSQL with SQLalchemy.

## Running the backend

Following steps are currently required to setup the project:

1. Setup python virtual environment
1. **From your virtual environment** install requirements using `pip3 install -r requirements.txt`
1. Bring up the database (from `../crest-annotation-docker` run `docker compose up -d db`)

Subsequently `uvicorn app.main:app` will bring up the backend at port 8000. Note that on the first run, SQLalchemy will implicitly create all tables.

## OpenAPI

The API specification is stored under `../crest-annotation-openapi/openapi.json`.

To generate the API specification enter the virtual environment and run:

```
python3 generate_openapi.py
```

With the backend running, the OpenAPI documentation can be viewed at `localhost:8000/docs#`.
