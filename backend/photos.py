"""Image Upload Routines."""

from __future__ import annotations

import os

# This is used so we can have a unique filename for every image file
import uuid
from typing import TYPE_CHECKING

# Boto 3 is the library that you can use to talk to S3 compatible APIs
import boto3
import dotenv
from botocore.exceptions import ClientError

if TYPE_CHECKING:
    from fastapi import UploadFile

success = dotenv.load_dotenv()
if not success:
    msg = "Couldn't read .env file"
    raise ValueError(msg)

# Setup S3 access

# Start by checking environment variables containing our keys
# You get these by visiting http://localhost:9000 and logging
# in and creating new access keys
# Then put them into the .env file
AWS_ACCESS_KEY = os.environ.get("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.environ.get("AWS_SECRET_KEY")

if AWS_ACCESS_KEY is None or AWS_SECRET_KEY is None:
    msg = "AWS_ACCESS_KEY and AWS_SECRET_KEY must be defined."
    raise ValueError(msg)

# You can put these urls into your .env if you want to run this in production
S3_PUBLIC_URL = os.environ.get("S3_PUBLIC_URL", "http://localhost:9000")
S3_ENDPOINT_URL = os.environ.get("S3_ENDPOINT_URL", "http://localhost:9000")

# Set a bucket name for our photos to be stored
BUCKET_NAME = "photos"

# Create the boto3 client

s3 = boto3.client(
    "s3",
    endpoint_url=S3_ENDPOINT_URL,
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name="us-east-1",
)


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


def upload_photo(image: UploadFile) -> str | None:
    """Upload an image to an S3 bucket and return the filename."""
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
