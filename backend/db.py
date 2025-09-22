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


def add_photo(photo_name: str, title: str | None = None, description: str | None = None) -> DBPhoto:
    """Add a single photo's name to the database."""
    with SessionLocal() as session:
        new_photo = DBPhoto(photo_name=photo_name, title=title, description=description)
        session.add(new_photo)
        session.commit()
        session.refresh(new_photo)
        return new_photo
