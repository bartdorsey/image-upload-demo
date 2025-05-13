from collections.abc import Sequence
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from db_models import DBPhoto

DATABASE_URL = "postgresql+psycopg://postgres:postgres@localhost:5432/photos"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


def get_photos() -> Sequence[DBPhoto]:
    with SessionLocal() as session:
        stmt = select(DBPhoto)
        return session.execute(stmt).scalars().all()


def add_photo(photo_name: str) -> DBPhoto:
    with SessionLocal() as session:
        new_photo = DBPhoto(photo_name=photo_name)
        session.add(new_photo)
        session.commit()
        session.refresh(new_photo)
        return new_photo
