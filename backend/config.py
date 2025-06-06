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
BUCKET_NAME = os.environ.get("BUCKET_NAME", "photos")

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
