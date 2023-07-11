# Computer vision backend for CREST annotation tool

Computer vision backend for CREST annotation tool based on FastAPI.

## Running the backend

Following steps are currently required to setup the project:

1. Setup python virtual environment
1. **From your virtual environment** install requirements using `pip3 install -r requirements.txt`

Subsequently `uvicorn app.main:app --port=<port>` will bring up the backend at the given port.
