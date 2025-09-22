"""Main FastAPI File."""

from __future__ import annotations

# Import config early to ensure environment variables are loaded first
import config  # noqa: F401
from config import CORS_ORIGINS

from typing import ClassVar

from fastapi import FastAPI, UploadFile, Form
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
    title: str | None = None
    description: str | None = None

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
        PhotoResponse(
            id=photo.id,
            photo_url=get_url(photo.photo_name),
            title=photo.title,
            description=photo.description
        )
        for photo in db.get_photos()
    ]


@app.post("/api/photos", response_model=PhotoResponse)
def upload_photo_endpoint(
    photo: UploadFile,
    title: str | None = Form(None),
    description: str | None = Form(None)
) -> PhotoResponse:
    """Upload a photo and save it to the database."""
    photo_name = upload_photo(photo)
    if photo_name is None:
        raise HTTPException(status_code=400, detail="Photo upload failed")
    db_photo = db.add_photo(photo_name, title=title, description=description)
    return PhotoResponse(
        id=db_photo.id,
        photo_url=get_url(db_photo.photo_name),
        title=db_photo.title,
        description=db_photo.description
    )
