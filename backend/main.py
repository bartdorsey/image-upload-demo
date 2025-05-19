from typing import ClassVar
import db
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import HTTPException
from pydantic import BaseModel, ConfigDict
from fastapi import UploadFile
from photos import upload_photo

app = FastAPI()

origins = ["http://localhost:5173"]


class PhotoResponse(BaseModel):
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
def get_photos_endpoint():
    return db.get_photos()


@app.post("/api/photos", response_model=PhotoResponse)
def upload_photo_endpoint(photo: UploadFile):
    print("Photo", photo)
    photo_name = upload_photo(photo)
    if photo_name is None:
        raise HTTPException(status_code=400, detail="Photo upload failed")
    return db.add_photo(photo_name)
