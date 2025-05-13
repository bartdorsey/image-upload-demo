import db
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import HTTPException
from pydantic import BaseModel
from fastapi import UploadFile, File
from photos import upload_photo, get_url

app = FastAPI()

origins = ["http://localhost:5173"]


class PhotoResponse(BaseModel):
    id: int
    photo_url: str | None = None


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/photos")
def get_photos_endpoint() -> list[PhotoResponse]:
    photos = db.get_photos()
    return [
        PhotoResponse(id=photo.id, photo_url=get_url(photo.photo_name))
        for photo in photos
    ]


@app.post("/api/photos")
def upload_photo_endpoint(photo: UploadFile = File()) -> PhotoResponse:
    print("Photo", photo)
    photo_name = upload_photo(photo)
    if photo_name is None:
        raise HTTPException(status_code=400, detail="Photo upload failed")
    new_photo = db.add_photo(photo_name)
    return PhotoResponse(
        id=new_photo.id, photo_url=get_url(new_photo.photo_name)
    )
