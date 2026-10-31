from pydantic import BaseModel, Field
from typing import Optional

class CatBreedBase(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    country: str = Field(min_length=2, max_length=100)
    size: str
    coat: str
    weight_max: float = Field(gt=0, le=30, alias="weightMax")
    lifespan: Optional[str] = None
    description: str = Field(min_length=10)
    kids_friendly: bool = Field(default=False, alias="kidsFriendly")
    image_url: Optional[str] = Field(default=None, alias="image")

class CatBreedCreate(CatBreedBase):
    pass

class CatBreedUpdate(BaseModel):
    name: Optional[str] = None
    country: Optional[str] = None
    size: Optional[str] = None
    coat: Optional[str] = None
    weight_max: Optional[float] = Field(default=None, alias="weightMax")
    lifespan: Optional[str] = None
    description: Optional[str] = None
    kids_friendly: Optional[bool] = Field(default=None, alias="kidsFriendly")
    image_url: Optional[str] = Field(default=None, alias="image")

class CatBreedResponse(CatBreedBase):
    id: int

    # Разрешаем Pydantic читать данные из объектов SQLAlchemy
    class Config:
        from_attributes = True
        populate_by_name = True