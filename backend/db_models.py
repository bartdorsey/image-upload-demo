"""SQLAlchemy Models."""

from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Base Class for SQLAlchemy Models."""


class DBPhoto(Base):
    """Model representing a photo in the datbase."""

    __tablename__: str = "photos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    photo_name: Mapped[str] = mapped_column()
    title: Mapped[str | None] = mapped_column(default=None)
    description: Mapped[str | None] = mapped_column(default=None)
