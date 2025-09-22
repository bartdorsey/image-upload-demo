# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend (FastAPI + PostgreSQL + MinIO)
```shell
# Start infrastructure
cd backend && docker compose up -d

# Initialize database
docker compose exec postgres psql -U postgres photos
# In psql: \i data/photos.sql

# Setup Python environment
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Start development server
fastapi dev

# Format Python code
black .
```

### Frontend (React + TypeScript + Vite)
```shell
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

### MinIO Setup
- Access MinIO console at http://localhost:9001 (admin:minioadmin / minioadmin)
- Create a bucket named "photos"
- Copy backend/.env.sample to backend/.env

## Architecture Overview

This is a full-stack image upload application with the following components:

### Backend Architecture
- **FastAPI** server with Python type hints and Pydantic models
- **PostgreSQL** database for photo metadata storage
- **MinIO** (S3-compatible) object storage for image files
- **SQLAlchemy** ORM for database interactions
- **boto3** for S3/MinIO file operations

Key files:
- `main.py`: FastAPI app with CORS middleware and photo endpoints
- `photos.py`: S3/MinIO upload and URL generation logic
- `db.py`: Database connection and photo CRUD operations
- `db_models.py`: SQLAlchemy models
- `config.py`: Environment configuration

### Frontend Architecture
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for development and building
- **React Router** for navigation

Key components:
- `PhotoList.tsx`: Displays uploaded photos in a grid
- `UploadForm.tsx`: File upload with drag-and-drop
- `SimpleUploadForm.tsx`: Basic file input upload

### Data Flow
1. Frontend uploads images via `/api/photos` POST endpoint
2. Backend saves file to MinIO and metadata to PostgreSQL
3. Frontend fetches photo list via `/api/photos` GET endpoint
4. Photos are served directly from MinIO using pre-signed URLs

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `AWS_ACCESS_KEY` / `AWS_SECRET_KEY`: MinIO credentials
- `S3_PUBLIC_URL` / `S3_ENDPOINT_URL`: MinIO endpoints
- `CORS_ORIGINS`: Frontend origins for CORS
- `BUCKET_NAME`: S3 bucket name (for deployment)