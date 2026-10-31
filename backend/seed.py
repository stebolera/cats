from database import SessionLocal, engine
import models

# Создаем таблицы (если их еще нет)
models.Base.metadata.create_all(bind=engine)

# 8 пород
breeds_data = [
    {
        "name": "Мейн-кун",
        "country": "США",
        "size": "large",
        "coat": "semi-long",
        "weight_max": 9,
        "lifespan": "12–15 лет",
        "description": "Крупная дружелюбная порода с полудлинной шерстью и спокойным характером.",
        "kids_friendly": True,
        "image_url": "../assets/images/maine-coon.jpg"
    },
    {
        "name": "Британская короткошёрстная",
        "country": "Великобритания",
        "size": "medium",
        "coat": "short",
        "weight_max": 8,
        "lifespan": "12–17 лет",
        "description": "Плюшевая шерсть, независимый нрав и крепкое здоровье — классика семейного любимца.",
        "kids_friendly": True,
        "image_url": "../assets/images/british-shorthair.jpg"
    },
    {
        "name": "Шотландская вислоухая",
        "country": "Шотландия",
        "size": "medium",
        "coat": "short",
        "weight_max": 6,
        "lifespan": "11–14 лет",
        "description": "Спокойная и ласковая порода с узнаваемыми сложенными ушками.",
        "kids_friendly": True,
        "image_url": "../assets/images/scottish-fold.jpg"
    },
    {
        "name": "Сибирская",
        "country": "Россия",
        "size": "large",
        "coat": "semi-long",
        "weight_max": 9,
        "lifespan": "11–15 лет",
        "description": "Крепкая порода с густой шерстью, ласковым характером и хорошим здоровьем.",
        "kids_friendly": True,
        "image_url": "../assets/images/siberian.jpg"
    },
    {
        "name": "Сфинкс",
        "country": "Канада",
        "size": "medium",
        "coat": "hairless",
        "weight_max": 5,
        "lifespan": "9–15 лет",
        "description": "Бесшёрстная и очень общительная кошка, требующая регулярного ухода за кожей.",
        "kids_friendly": True,
        "image_url": "../assets/images/sphynx.jpg"
    },
    {
        "name": "Бенгальская",
        "country": "США",
        "size": "medium",
        "coat": "short",
        "weight_max": 7,
        "lifespan": "12–16 лет",
        "description": "Активная и игривая порода с эффектным «леопардовым» окрасом.",
        "kids_friendly": False,
        "image_url": "../assets/images/bengal.jpg"
    },
    {
        "name": "Абиссинская",
        "country": "Эфиопия",
        "size": "medium",
        "coat": "short",
        "weight_max": 5,
        "lifespan": "12–15 лет",
        "description": "Игривая и любопытная кошка с короткой шерстью и «диким» окрасом.",
        "kids_friendly": False,
        "image_url": "../assets/images/abyssinian.jpg"
    },
    {
        "name": "Персидская",
        "country": "Иран",
        "size": "medium",
        "coat": "long",
        "weight_max": 6,
        "lifespan": "10–17 лет",
        "description": "Роскошная длинная шерсть и спокойный нрав, но требует ежедневного вычёсывания.",
        "kids_friendly": True,
        "image_url": "../assets/images/persian.jpg"
    }
]


def seed_db():
    db = SessionLocal()
    try:
        # Проверяем, есть ли уже данные в базе, чтобы не дублировать
        existing = db.query(models.CatBreed).first()
        if existing:
            print("В базе данных уже есть записи. Скрипт остановлен, чтобы не дублировать породы.")
            return

        print("Начинаю добавление пород в базу данных...")

        for item in breeds_data:
            db_breed = models.CatBreed(**item)
            db.add(db_breed)

        db.commit()
        print(f"Успешно добавлено {len(breeds_data)} пород!")

    except Exception as e:
        print(f"Произошла ошибка: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_db()