from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class DBPhoto(Base):
    __tablename__ = "photos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    photo_name: Mapped[str] = mapped_column()
