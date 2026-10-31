from sqlalchemy import Integer, String, Text, Boolean, Float
from sqlalchemy.orm import Mapped, mapped_column
from database import Base

class CatBreed(Base):
    __tablename__ = "breeds"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    size: Mapped[str] = mapped_column(String(20), nullable=False)
    coat: Mapped[str] = mapped_column(String(20), nullable=False)
    weight_max: Mapped[float] = mapped_column(Float, nullable=False)
    lifespan: Mapped[str] = mapped_column(String(50), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    kids_friendly: Mapped[bool] = mapped_column(Boolean, default=False)
    image_url: Mapped[str] = mapped_column(String(500), nullable=True)