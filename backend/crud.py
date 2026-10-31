from sqlalchemy.orm import Session
from models import CatBreed
from schemas import CatBreedCreate, CatBreedUpdate

def get_breeds(db: Session, skip: int = 0, limit: int = 100):
    return db.query(CatBreed).offset(skip).limit(limit).all()

def get_breed(db: Session, breed_id: int):
    return db.query(CatBreed).filter(CatBreed.id == breed_id).first()

def create_breed(db: Session, breed: CatBreedCreate):
    db_breed = CatBreed(**breed.model_dump(by_alias=False))
    db.add(db_breed)
    db.commit()
    db.refresh(db_breed)
    return db_breed

def update_breed(db: Session, breed_id: int, breed: CatBreedUpdate):
    db_breed = get_breed(db, breed_id)
    if db_breed:
        update_data = breed.model_dump(exclude_unset=True, by_alias=False)
        for key, value in update_data.items():
            setattr(db_breed, key, value)
        db.commit()
        db.refresh(db_breed)
    return db_breed

def delete_breed(db: Session, breed_id: int):
    db_breed = get_breed(db, breed_id)
    if db_breed:
        db.delete(db_breed)
        db.commit()
    return db_breed