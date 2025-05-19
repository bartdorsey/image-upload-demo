"""Main FastAPI File."""

from __future__ import annotations

from typing import TYPE_CHECKING, ClassVar

from fastapi import FastAPI, UploadFile
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict

import db
from photos import upload_photo

if TYPE_CHECKING:
    from collections.abc import Sequence

    from db_models import DBPhoto

app = FastAPI()

origins = ["http://localhost:5173"]


class PhotoResponse(BaseModel):
    """Represents the response we send back for a single photo."""

    id: int
    photo_url: str | None = None

    model_config: ClassVar[ConfigDict] = ConfigDict(from_attributes=True)


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/photos", response_model=list[PhotoResponse])
def get_photos_endpoint() -> Sequence[DBPhoto]:
    """Return all photos from the database."""
    return db.get_photos()


@app.post("/api/photos", response_model=PhotoResponse)
def upload_photo_endpoint(photo: UploadFile) -> DBPhoto:
    """Upload a photo and save it to the database."""
    photo_name = upload_photo(photo)
    if photo_name is None:
        raise HTTPException(status_code=400, detail="Photo upload failed")
    return db.add_photo(photo_name)
