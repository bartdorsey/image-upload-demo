# Lesson: Image Uploads in FastAPI and S3 Integration

## Introduction

This lesson will guide you through implementing image uploads in a FastAPI application and storing those images in an S3-compatible object storage service (such as AWS S3 or MinIO). You should already be familiar with FastAPI basics, including request handling and dependency injection.

---

## MinIO vs AWS S3

This project is configured to use **MinIO**, an open-source, self-hosted object storage server that is compatible with the S3 API. This means you can run and test the project locally without needing an AWS account or incurring any cloud costs. The S3 client in the code is pointed at the MinIO server using the `S3_ENDPOINT_URL` in `config.py`.

If you want to use **AWS S3** instead, you only need to:

- Change the `S3_ENDPOINT_URL` in your `config.py` to the AWS S3 endpoint (or remove it to use the default).
- Set your AWS credentials (`AWS_ACCESS_KEY`, `AWS_SECRET_KEY`) to your AWS IAM user's credentials.
- Make sure your `BUCKET_NAME` exists in your AWS account.

Because MinIO implements the same API as AWS S3, no code changes are needed—just update your configuration.

---

## About `config.py` and Environment Variables

All sensitive configuration for S3 access—such as your access key, secret key, endpoint URL, and bucket name—are stored in `config.py`. This file is designed to read these values from environment variables, so you never hard-code secrets in your source code. This makes it easy to switch between MinIO and AWS S3, and keeps your credentials secure.

Here's how our `config.py` file is set up:

```python
# filepath: /home/febpt2025/projects/image-upload-demo/backend/config.py
"""Configuration module for environment variables."""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
# This should be imported before any other module that needs environment
# variables
success = load_dotenv()
if not success:
    print("Warning: .env file not found or couldn't be loaded.")

# Database configuration
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+psycopg://postgres:postgres@localhost:5432/photos",
)

# S3 configuration
AWS_ACCESS_KEY = os.environ.get("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.environ.get("AWS_SECRET_KEY")
S3_PUBLIC_URL = os.environ.get("S3_PUBLIC_URL", "http://localhost:9000")
S3_ENDPOINT_URL = os.environ.get("S3_ENDPOINT_URL", "http://localhost:9000")
BUCKET_NAME = "photos"

# Check that we have the required AWS credentials
if AWS_ACCESS_KEY is None or AWS_SECRET_KEY is None:
    msg = "AWS_ACCESS_KEY and AWS_SECRET_KEY must be defined in .env file."
    raise ValueError(msg)

# CORS configuration
# Format for CORS_ORIGINS should be comma-separated values
# e.g. "http://localhost:5173,https://example.com"
# Default allows the Vite development server
cors_origins_value = os.environ.get("CORS_ORIGINS", "http://localhost:5173")
CORS_ORIGINS = cors_origins_value.split(",")
```

To set these variables, you can use a `.env` file, Docker Compose environment settings, or export them in your shell before running the backend. This approach is a best practice for managing secrets and configuration in any production application.

---

## 1. Handling File Uploads in FastAPI

FastAPI makes it easy to accept file uploads using the `UploadFile` type. In this project, the backend expects the uploaded file to be sent as a form field named `photo` to the `/api/photos` endpoint. Here's a minimal example:

```python
from fastapi import FastAPI, UploadFile

app = FastAPI()

@app.post("/api/photos")
def upload_photo_endpoint(photo: UploadFile):
    # photo is an UploadFile object
    return {"filename": photo.filename}
```

- `UploadFile` provides a file-like interface and metadata (filename, content type).
- Use `photo.file` for a file-like object (no need to read all bytes into memory).

---

## 2. Why Use S3 for Image Storage?

Storing images in your database or local filesystem is not scalable. S3-compatible storage is:

- **Durable** and **scalable**
- Accessible via HTTP(S)
- Supports pre-signed URLs for secure, temporary access

---

## 3. Setting Up S3 Access with Boto3

Install the `boto3` library:

```sh
pip install boto3
```

In this project, S3 credentials and settings are stored in `config.py` and imported in our `photos.py` module. The S3 client is created like this:

```python
# filepath: /home/febpt2025/projects/image-upload-demo/backend/photos.py
"""Image Upload Routines."""

from __future__ import annotations

# This is used so we can have a unique filename for every image file
import uuid
from typing import TYPE_CHECKING

# Boto 3 is the library that you can use to talk to S3 compatible APIs
import boto3
from botocore.exceptions import ClientError

# Import from our centralized config module
from config import (
    AWS_ACCESS_KEY,
    AWS_SECRET_KEY,
    S3_ENDPOINT_URL,
    BUCKET_NAME,
)

if TYPE_CHECKING:
    from fastapi import UploadFile

# Create the boto3 client
s3 = boto3.client(
    "s3",
    endpoint_url=S3_ENDPOINT_URL,
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name="us-east-1",
)
```

---

## 4. Uploading Images to S3

The backend uses a helper function to generate a unique filename and upload the file to S3. This is implemented in `photos.py`:

### Security: Validating Uploads

Before uploading any file to S3, we validate it to ensure only appropriate images are accepted. This is an important security practice:

```python
# Constants for validation
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB max size
ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
]


def validate_image(image: UploadFile) -> bool:
    """
    Validate the image file before uploading.

    Returns:
        bool: True if valid, False otherwise
    """
    # Check file type (content_type)
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        error_message = (
            f"Unsupported file type: {image.content_type}. "
            f"Allowed types: {', '.join(ALLOWED_IMAGE_TYPES)}"
        )
        print(f"Image validation failed: {error_message}")  # noqa: T201
        return False

    # Check file size
    # First store current position
    current_position = image.file.tell()

    # Move to end to get size
    image.file.seek(0, 2)
    size = image.file.tell()

    # Return to original position
    image.file.seek(current_position)

    if size > MAX_IMAGE_SIZE_BYTES:
        max_mb = MAX_IMAGE_SIZE_BYTES / (1024 * 1024)
        error_msg = f"File too large: {size} bytes. Max size: {max_mb} MB"
        print(f"Image validation failed: {error_msg}")  # noqa: T201
        return False

    return True
```

The validation function performs two important checks:

1. **Content Type Validation**: Ensures the file is actually an image and in an accepted format (JPEG, PNG, GIF, or WebP).
2. **Size Validation**: Ensures the file is not too large (5 MB limit), preventing denial-of-service attacks via huge file uploads.

Note how we use `file.seek()` to measure the file size without reading its contents into memory. This is efficient and works with files of any size.

### Upload Function

The `upload_photo` function now uses this validation before proceeding with the upload:

```python
def upload_photo(image: UploadFile) -> str | None:
    """Upload an image to an S3 bucket and return the filename."""
    # Validate the image before proceeding
    if not validate_image(image):
        return None

    # Create a unique filename, based on the filename we get
    # Plus a uuid (Universal Unique ID)
    # Keeps users from overwriting each other's files
    photo_name = f"{uuid.uuid4()}_{image.filename}"
    try:
        # Upload the file to the bucket
        s3.upload_fileobj(
            image.file,
            BUCKET_NAME,
            photo_name,
            ExtraArgs={
                "ContentType": image.content_type,
            },
        )
    except ClientError as e:
        print(e)  # noqa: T201
        return None
    return photo_name
```

- The upload only proceeds if the validation passes
- By returning `None` when validation fails, the API can provide an appropriate error response
- When validation passes, we generate a unique filename with UUID to prevent collisions
- Appropriate content type is preserved for the uploaded file

---

## 5. Generating Pre-Signed URLs

To allow users to access images securely, the backend generates a pre-signed URL using another helper in `photos.py`:

```python
# The way AWS S3 works is, you get temporary pre-signed URLs to items
# in the bucket. These expire so you always need to go get new ones
def get_url(photo_name: str) -> str | None:
    """Return the full URL to a photo."""
    try:
        return s3.generate_presigned_url(
            "get_object",
            ExpiresIn=604800,
            Params={"Bucket": BUCKET_NAME, "Key": photo_name},
        )
    except ClientError as e:
        print(e)  # noqa: T201
        return None
```

- This function returns a temporary URL to access the image.
- The URL expires after 7 days (604800 seconds).

---

## 6. The Complete Upload Flow in This Project

The main upload endpoint is defined in `main.py`:

```python
# filepath: /home/febpt2025/projects/image-upload-demo/backend/main.py
"""Main FastAPI File."""

from __future__ import annotations

# Import config early to ensure environment variables are loaded first
import config  # noqa: F401
from config import CORS_ORIGINS

from typing import ClassVar

from fastapi import FastAPI, UploadFile
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict

import db
from photos import upload_photo, get_url


app = FastAPI()


class PhotoResponse(BaseModel):
    """Represents the response we send back for a single photo."""

    id: int
    photo_url: str | None = None

    model_config: ClassVar[ConfigDict] = ConfigDict(from_attributes=True)


app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/photos", response_model=list[PhotoResponse])
def get_photos_endpoint() -> list[PhotoResponse]:
    """Return all photos from the database."""
    return [
        PhotoResponse(id=photo.id, photo_url=get_url(photo.photo_name))
        for photo in db.get_photos()
    ]


@app.post("/api/photos", response_model=PhotoResponse)
def upload_photo_endpoint(photo: UploadFile) -> PhotoResponse:
    """Upload a photo and save it to the database."""
    photo_name = upload_photo(photo)
    if photo_name is None:
        raise HTTPException(status_code=400, detail="Photo upload failed")
    db_photo = db.add_photo(photo_name)
    return PhotoResponse(
        id=db_photo.id, photo_url=get_url(db_photo.photo_name)
    )
```

- The uploaded file is saved to S3 and the filename is stored in the database.
- The response includes a pre-signed URL for accessing the image.
- We also set up CORS middleware to allow our frontend to communicate with our backend.

---

## What is Stored in the Database?

When a photo is uploaded, the backend does **not** store the image itself in the database. Instead, it stores only the generated unique filename (the S3 object key) in the database. This filename is used to retrieve the image from S3/MinIO when needed.

Our database tables are defined using SQLAlchemy's modern type annotations in `db_models.py`:

```python
# filepath: /home/febpt2025/projects/image-upload-demo/backend/db_models.py
"""SQLAlchemy Models."""

from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Base Class for SQLAlchemy Models."""


class DBPhoto(Base):
    """Model representing a photo in the datbase."""

    __tablename__: str = "photos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    photo_name: Mapped[str] = mapped_column()
```

And our database operations are implemented in `db.py`:

```python
# filepath: /home/febpt2025/projects/image-upload-demo/backend/db.py
"""Database routines."""

from collections.abc import Sequence
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from db_models import Base, DBPhoto

# Import from our centralized config module
from config import DATABASE_URL

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# Create all tables defined in the models
Base.metadata.create_all(bind=engine)


def get_photos() -> Sequence[DBPhoto]:
    """Get all the photos from the database."""
    with SessionLocal() as session:
        stmt = select(DBPhoto)
        return session.execute(stmt).scalars().all()


def add_photo(photo_name: str) -> DBPhoto:
    """Add a single photo's name to the database."""
    with SessionLocal() as session:
        new_photo = DBPhoto(photo_name=photo_name)
        session.add(new_photo)
        session.commit()
        session.refresh(new_photo)
        return new_photo
```

- The `DBPhoto` table stores the unique filename (S3 key) for each uploaded image.
- The `add_photo` function inserts a new photo record and returns the database object.
- We use context managers (`with` statements) to ensure sessions are properly closed.

---

## 7. Security and Best Practices

- Validate file types and sizes before uploading (the backend should do this).
- Never trust the filename from the client - we use UUID to avoid collisions.
- Use environment variables for credentials (as in `config.py`).
- Set appropriate bucket policies and CORS rules.

---

## Summary

- Use FastAPI's `UploadFile` for file uploads.
- Use `boto3` to upload files to S3-compatible storage.
- Store only the filename in your database, not the image itself.
- Generate pre-signed URLs for secure access.
- Always validate and sanitize uploads.

---

## Further Reading

- [FastAPI File Uploads](https://fastapi.tiangolo.com/tutorial/request-files/)
- [Boto3 S3 Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3.html)
- [AWS S3 Pre-Signed URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html)

---

