FROM python:3.9

WORKDIR /code

COPY ./crest-annotation-backend/requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./crest-annotation-backend/app /code/app
COPY ./crest-annotation-docker/examples /code/examples
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]