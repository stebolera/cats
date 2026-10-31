from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List

import models, schemas, crud
from database import engine, get_db

# Создаем таблицы в БД при запуске сервера
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Котолог API",
    description="API для каталога пород кошек",
    version="1.0.0"
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Эндпоинты API
@app.get("/api/breeds", response_model=List[schemas.CatBreedResponse])
def read_breeds(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_breeds(db, skip=skip, limit=limit)

@app.post("/api/breeds", response_model=schemas.CatBreedResponse, status_code=status.HTTP_201_CREATED)
def create_breed(breed: schemas.CatBreedCreate, db: Session = Depends(get_db)):
    return crud.create_breed(db, breed)

@app.get("/api/breeds/{breed_id}", response_model=schemas.CatBreedResponse)
def read_breed(breed_id: int, db: Session = Depends(get_db)):
    db_breed = crud.get_breed(db, breed_id)
    if db_breed is None:
        raise HTTPException(status_code=404, detail="Порода не найдена")
    return db_breed

@app.patch("/api/breeds/{breed_id}", response_model=schemas.CatBreedResponse)
def update_breed(breed_id: int, breed: schemas.CatBreedUpdate, db: Session = Depends(get_db)):
    db_breed = crud.update_breed(db, breed_id, breed)
    if db_breed is None:
        raise HTTPException(status_code=404, detail="Порода не найдена")
    return db_breed

@app.delete("/api/breeds/{breed_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_breed(breed_id: int, db: Session = Depends(get_db)):
    db_breed = crud.delete_breed(db, breed_id)
    if db_breed is None:
        raise HTTPException(status_code=404, detail="Порода не найдена")
    return None

app.mount("/assets", StaticFiles(directory="../assets"), name="assets")
app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")