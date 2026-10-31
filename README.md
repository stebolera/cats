# Котолог — каталог пород кошек

Веб-приложение с клиент-серверной архитектурой для хранения, просмотра и управления информацией о породах кошек.

## Выбранная тема
Справочник (каталог) кошек.

## Основная сущность

Порода кошки (`CatBreed`).

**Поля сущности:**
- `id` — уникальный идентификатор (первичный ключ)
- `name` — название породы
- `country` — страна происхождения
- `size` — размер (small, medium, large)
- `coat` — тип шерсти (short, semi-long, long, hairless)
- `weight_max` — максимальный вес в кг
- `lifespan` — продолжительность жизни
- `description` — текстовое описание породы
- `kids_friendly` — подходит ли для семей с детьми (boolean)
- `image_url` — путь к изображению

## API

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/breeds` | Получить список всех пород |
| POST | `/api/breeds` | Создать новую породу |
| GET | `/api/breeds/{id}` | Получить породу по её id |
| PATCH | `/api/breeds/{id}` | Частично обновить данные породы |
| DELETE | `/api/breeds/{id}` | Удалить породу из базы данных |

## Используемый стек
- **Backend:** Python, FastAPI, SQLAlchemy, Pydantic, SQLite
- **Frontend:** HTML, CSS, Vanilla JavaScript (Fetch API)
- **Документация:** Swagger UI / OpenAPI

---

## Инструкция по запуску

### 1. Установка зависимостей и запуск базы данных
База данных SQLite создается автоматически при первом запуске сервера. Для её первичного заполнения (8 демонстрационных пород) используется скрипт `seed.py`.

Перейдите в папку backend и настройте виртуальное окружение:

```bash
cd backend
python -m venv venv
```
Активируйте виртуальное окружение:
- Windows (PowerShell/CMD):
```bash
..\venv\Scripts\activate
```
- Mac/Linux:
```bash
source ../venv/bin/activate
```
Установите необходимые библиотеки:
```bash
pip install -r requirements.txt
```
### 2. Запуск Backend
Находясь в папке backend, запустите сервер FastAPI:

```bash
uvicorn main:app --reload
```
Сервер будет запущен по адресу http://127.0.0.1:8000.

---

### 3. Запуск Frontend
В данном проекте настроена раздача статики через FastAPI. Запускать фронтенд через Live Server или отдельный порт не нужно.

После запуска бэкенда просто откройте в браузере корень сайта:

**http://127.0.0.1:8000/**

---

### 4. Swagger UI (Документация API)
Интерактивная документация со всеми методами и схемами данных доступна по адресу:

**http://127.0.0.1:8000/docs**

---
## Примеры запросов
Примечание: В Pydantic-схемах настроены alias-поля, поэтому API принимает JSON с ключами weightMax, kidsFriendly и image.

**Создание новой породы (POST /api/breeds):**

```json
{
  "name": "Манчкин",
  "country": "США",
  "size": "small",
  "coat": "short",
  "weightMax": 4,
  "lifespan": "12–15 лет",
  "description": "Коротколапая порода с дружелюбным характером.",
  "kidsFriendly": true,
  "image": ""
}
```
**Получение списка всех пород (GET /api/breeds):**

Просто выполните GET-запрос по адресу http://127.0.0.1:8000/api/breeds. Ответ будет представлять собой массив JSON-объектов:

```json
  {
    "id": 1,
    "name": "Мейн-кун",
    "country": "США",
    "size": "large",
    "coat": "semi-long",
    "weight_max": 9.0,
    "lifespan": "12–15 лет",
    "description": "Крупная дружелюбная порода...",
    "kids_friendly": true,
    "image_url": "../assets/images/maine-coon.jpg"
  }
```

**Частичное обновление породы (PATCH /api/breeds/{id}):**

Например, чтобы изменить только название породы с id=1:

```json
{
  "name": "Мейн-кун (Американский)"
}
```

**Удаление породы (DELETE /api/breeds/{id}):**

Для удаления породы с id=1 отправьте DELETE-запрос на http://127.0.0.1:8000/api/breeds/1. При успешном выполнении сервер вернет статус-код 204 No Content.

---

### Структура проекта
```text
cats/
├── backend/
│   ├── main.py            # Точка входа FastAPI, настройка CORS и статики
│   ├── database.py        # Подключение к SQLite и сессия SQLAlchemy
│   ├── models.py          # Модель SQLAlchemy для таблицы breeds
│   ├── schemas.py         # Pydantic-схемы для валидации данных
│   ├── crud.py            # Функции работы с базой данных
│   ├── requirements.txt   # Зависимости Python
│   └── kotolog.db         # Файл базы данных SQLite
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
├── assets/
│   ├── fonts/
│   └── images/
├── README.md
└── REPORT-3.md
```

Чтобы остановить сервер, нажмите Ctrl + C в терминале.