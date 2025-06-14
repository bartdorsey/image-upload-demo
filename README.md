# Image Upload Demo

This demonstrates using Minio (Amazon S3 clone) to upload images

Minio is an open source clone of Amazon S3, it uses the same API.

This uses the python boto3 library to upload images

There is a React frontend and a FastAPI backend

To set this up:

## Backend

Inside the backend folder:

First, start up the two docker containers (postgres and minio)
with

```shell
docker compose up -d
```

Create your database

```shell
docker compose exec postgres psql -U postgres photos
psql# \i data/photos.sql
```

Login to the minio web interface with u: minioadmin p: minioadmin

http://localhost:9001

Create a new bucket named "photos"

Copy the .env.sample file to .env in the backend folder

`cp .env.sample .env`

Finally create a new virtual environment, pip install, and start up FastAPI.

```shell
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
fastapi dev
```

Visit http://localhost:8000/docs

## Frontend

Inside the frontend folder:

`npm install`

`npm run dev`

Visit http://localhost:5173
