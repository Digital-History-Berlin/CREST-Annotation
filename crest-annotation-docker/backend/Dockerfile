FROM python:3.10-slim

WORKDIR /code

COPY ./crest-annotation-backend/requirements.txt /code/requirements.txt
RUN pip install -r /code/requirements.txt

COPY ./crest-annotation-backend/app /code/app
COPY ./crest-annotation-backend/alembic.ini /code/alembic.ini
COPY ./crest-annotation-backend/alembic /code/alembic
COPY ./crest-annotation-docker/examples /code/examples
EXPOSE 8000

VOLUME [ "/code/data" ]

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]