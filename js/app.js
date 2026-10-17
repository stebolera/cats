'use strict';

/* Блок 1. Демонстрационные данные (Default State) */

const DEFAULT_ITEMS = [
  {
    id: 'maine-coon',
    name: 'Мейн-кун',
    country: 'США',
    size: 'large',
    coat: 'semi-long',
    weightMax: 9,
    lifespan: '12–15 лет',
    description: 'Крупная дружелюбная порода с полудлинной шерстью и спокойным характером.',
    kidsFriendly: true,
    image: 'assets/images/maine-coon.jpg'
  },
  {
    id: 'british-shorthair',
    name: 'Британская короткошёрстная',
    country: 'Великобритания',
    size: 'medium',
    coat: 'short',
    weightMax: 8,
    lifespan: '12–17 лет',
    description: 'Плюшевая шерсть, независимый нрав и крепкое здоровье — классика семейного любимца.',
    kidsFriendly: true,
    image: 'assets/images/british-shorthair.jpg'
  },
  {
    id: 'scottish-fold',
    name: 'Шотландская вислоухая',
    country: 'Шотландия',
    size: 'medium',
    coat: 'short',
    weightMax: 6,
    lifespan: '11–14 лет',
    description: 'Спокойная и ласковая порода с узнаваемыми сложенными ушками.',
    kidsFriendly: true,
    image: 'assets/images/scottish-fold.jpg'
  },
  {
    id: 'siberian',
    name: 'Сибирская',
    country: 'Россия',
    size: 'large',
    coat: 'semi-long',
    weightMax: 9,
    lifespan: '11–15 лет',
    description: 'Крепкая порода с густой шерстью, ласковым характером и хорошим здоровьем.',
    kidsFriendly: true,
    image: 'assets/images/siberian.jpg'
  },
  {
    id: 'sphynx',
    name: 'Сфинкс',
    country: 'Канада',
    size: 'medium',
    coat: 'hairless',
    weightMax: 5,
    lifespan: '9–15 лет',
    description: 'Бесшёрстная и очень общительная кошка, требующая регулярного ухода за кожей.',
    kidsFriendly: true,
    image: 'assets/images/sphynx.jpg'
  },
  {
    id: 'bengal',
    name: 'Бенгальская',
    country: 'США',
    size: 'medium',
    coat: 'short',
    weightMax: 7,
    lifespan: '12–16 лет',
    description: 'Активная и игривая порода с эффектным «леопардовым» окрасом.',
    kidsFriendly: false,
    image: 'assets/images/bengal.jpg'
  },
  {
    id: 'abyssinian',
    name: 'Абиссинская',
    country: 'Эфиопия',
    size: 'medium',
    coat: 'short',
    weightMax: 5,
    lifespan: '12–15 лет',
    description: 'Игривая и любопытная кошка с короткой шерстью и «диким» окрасом.',
    kidsFriendly: false,
    image: 'assets/images/abyssinian.jpg'
  },
  {
    id: 'persian',
    name: 'Персидская',
    country: 'Иран',
    size: 'medium',
    coat: 'long',
    weightMax: 6,
    lifespan: '10–17 лет',
    description: 'Роскошная длинная шерсть и спокойный нрав, но требует ежедневного вычёсывания.',
    kidsFriendly: true,
    image: 'assets/images/persian.jpg'
  }
];

/* Ключ, под которым список пород хранится в localStorage */
const STORAGE_KEY = 'kotolog.items.v1';


/* Блок 2. Утилиты */

/* SVG-заглушка через data-URI — если фото нет или оно не загрузилось */
const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#e3e6d5"/>
      <text x="200" y="155" text-anchor="middle"
            font-family="sans-serif" font-size="20" fill="#6b7d55">Фото</text>
    </svg>`
  );

/* Словари: технический код → русская подпись */
const SIZE_LABELS = {
  small: 'малый',
  medium: 'средний',
  large: 'крупный'
};

const COAT_LABELS = {
  short: 'короткая',
  'semi-long': 'полудлинная',
  long: 'длинная',
  hairless: 'без шерсти'
};

/* Возвращает русскую подпись размера (или исходное значение) */
function sizeLabel(size) {
  return SIZE_LABELS[size] || size;
}

/* Возвращает русскую подпись типа шерсти */
function coatLabel(coat) {
  return COAT_LABELS[coat] || coat;
}


/* Блок 3. State и работа с localStorage */

/* Читает список пород из localStorage; при ошибке — дефолтные данные */
function loadItemsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ITEMS.map(item => ({ ...item }));

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_ITEMS.map(item => ({ ...item }));
    return parsed;
  } catch (err) {
    console.warn('Не удалось прочитать localStorage, загружены демо-данные.', err);
    return DEFAULT_ITEMS.map(item => ({ ...item }));
  }
}

/* Единый объект состояния — источник правды для всего приложения */
const state = {
  items: loadItemsFromStorage(),
  searchQuery: '',
  selectedSize: 'all',
  selectedCoat: 'all',
  sortBy: 'name-asc'
};

/* Сохраняет state.items в localStorage через JSON.stringify */
function saveItems() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  } catch (err) {
    console.warn('Не удалось сохранить в localStorage.', err);
  }
}


/* Блок 4. Производные данные: поиск + фильтр + сортировка */

function getVisibleItems() {
  const query = state.searchQuery.trim().toLowerCase();

  /* Фильтрация по поиску (название/страна), размеру и типу шерсти */
  const filtered = state.items.filter(item => {
    const matchesSearch =
      query === '' ||
      item.name.toLowerCase().includes(query) ||
      item.country.toLowerCase().includes(query);

    const matchesSize =
      state.selectedSize === 'all' || item.size === state.selectedSize;

    const matchesCoat =
      state.selectedCoat === 'all' || item.coat === state.selectedCoat;

    return matchesSearch && matchesSize && matchesCoat;
  });

  /* Копия массива */
  const sorted = [...filtered];

  /* Сортировка */
  switch (state.sortBy) {
    case 'name-asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
      break;
    case 'name-desc':
      sorted.sort((a, b) => b.name.localeCompare(a.name, 'ru'));
      break;
    case 'weight-asc':
      sorted.sort((a, b) => a.weightMax - b.weightMax);
      break;
    case 'weight-desc':
      sorted.sort((a, b) => b.weightMax - a.weightMax);
      break;
    default:
      break;
  }

  return sorted;
}

/* Блок 5. Ссылки на DOM-элементы */

const cardsContainer = document.getElementById('cards');
const filterCountEl = document.getElementById('filter-count');

const searchInput = document.getElementById('search');
const sizeFilter = document.getElementById('size-filter');
const coatFilter = document.getElementById('coat-filter');
const sortSelect = document.getElementById('sort');

const addButton = document.getElementById('add-btn');
const resetButton = document.getElementById('reset-btn');

const modal = document.getElementById('modal');
const form = document.getElementById('add-form');

const imageInput = document.getElementById('f-image');
const imagePreview = document.getElementById('image-preview');
const imagePreviewImg = document.getElementById('image-preview-img');
const imageRemoveBtn = document.getElementById('image-remove');


/* Блок 5.1. Работа с фото в форме */

const MAX_IMAGE_SIZE = 1024 * 1024; // 1 МБ
let currentImageDataUrl = '';       // сюда кладётся прочитанная картинка

/* Проверяет файл, читает как Data URL и показывает превью */
function handleImageSelect(file) {
  clearImageError();

  if (!file) {
    resetImagePreview();
    return;
  }

  if (!file.type.startsWith('image/')) {
    showError(imageInput, 'Выберите файл изображения');
    imageInput.value = '';
    return;
  }

  if (file.size > MAX_IMAGE_SIZE) {
    showError(
      imageInput,
      `Файл больше ${Math.round(MAX_IMAGE_SIZE / 1024 / 1024 * 10) / 10} МБ. Выберите меньше.`
    );
    imageInput.value = '';
    return;
  }

  const reader = new FileReader();

  reader.addEventListener('load', () => {
    currentImageDataUrl = String(reader.result);
    imagePreviewImg.src = currentImageDataUrl;
    imagePreview.hidden = false;
  });

  reader.addEventListener('error', () => {
    showError(imageInput, 'Не удалось прочитать файл');
  });

  reader.readAsDataURL(file);
}

/* Сбрасывает превью и сохранённый Data URL */
function resetImagePreview() {
  currentImageDataUrl = '';
  imagePreviewImg.removeAttribute('src');
  imagePreview.hidden = true;
  imageInput.value = '';
}

/* Снимает ошибку с поля загрузки файла */
function clearImageError() {
  imageInput.classList.remove('is-invalid');
  const target = form.querySelector('[data-error-for="f-image"]');
  if (target) target.textContent = '';
}

/* Пользователь выбрал файл */
imageInput.addEventListener('change', e => {
  const file = e.target.files && e.target.files[0];
  handleImageSelect(file);
});

/* Кнопка «Удалить фото» */
imageRemoveBtn.addEventListener('click', () => {
  resetImagePreview();
});


/* Блок 6. Render — отрисовка карточек по state */

/* Создаёт DOM-элемент одной карточки породы */
function createCardElement(item) {
  const card = document.createElement('article');
  card.className = 'card';
  card.dataset.id = item.id;

  /* Картинка породы (или заглушка при ошибке загрузки) */
  const img = document.createElement('img');
  img.src = item.image || PLACEHOLDER_IMAGE;
  img.alt = item.name;
  img.loading = 'lazy';
  img.addEventListener('error', () => {
    img.src = PLACEHOLDER_IMAGE;
  });
  card.appendChild(img);

  /* Название */
  const title = document.createElement('h3');
  title.textContent = item.name;
  card.appendChild(title);

  /* Описание */
  const desc = document.createElement('p');
  desc.textContent = item.description;
  card.appendChild(desc);

  /* Список характеристик */
  const props = document.createElement('ul');
  props.className = 'card-props';

  const rows = [
    ['Страна', item.country],
    ['Размер', sizeLabel(item.size)],
    ['Шерсть', coatLabel(item.coat)],
    ['Вес', `до ${item.weightMax} кг`],
    ['Жизнь', item.lifespan || '—']
  ];

  rows.forEach(([label, value]) => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = label + ':';
    li.appendChild(span);
    li.appendChild(document.createTextNode(' ' + value));
    props.appendChild(li);
  });

  card.appendChild(props);

  /* Кнопка удаления с data-action="delete" — её ловит делегирование */
  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'card__delete';
  deleteBtn.dataset.action = 'delete';
  deleteBtn.textContent = 'Удалить';
  card.appendChild(deleteBtn);

  return card;
}

/* Полная перерисовка контейнера карточек по актуальному state */
function render() {
  const items = getVisibleItems();

  cardsContainer.textContent = '';

  if (items.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent =
      state.items.length === 0
        ? 'Каталог пуст. Добавьте первую породу кнопкой «Добавить породу».'
        : 'Ничего не найдено. Попробуйте изменить условия поиска.';
    cardsContainer.appendChild(empty);
  } else {
    /* Карточки собираем в фрагмент — вставляем в DOM одним движением */
    const fragment = document.createDocumentFragment();
    items.forEach(item => fragment.appendChild(createCardElement(item)));
    cardsContainer.appendChild(fragment);
  }

  /* Счётчик найденного */
  const total = state.items.length;
  const shown = items.length;
  filterCountEl.textContent =
    shown === total
      ? `Показано пород: ${shown}`
      : `Найдено: ${shown} из ${total}`;
}


/* Блок 7. Обработчики поиска, фильтров, сортировки, сброса */

searchInput.addEventListener('input', e => {
  state.searchQuery = e.target.value;
  render();
});

sizeFilter.addEventListener('change', e => {
  state.selectedSize = e.target.value;
  render();
});

coatFilter.addEventListener('change', e => {
  state.selectedCoat = e.target.value;
  render();
});

sortSelect.addEventListener('change', e => {
  state.sortBy = e.target.value;
  render();
});

/* Сброс всех фильтров к значениям по умолчанию */
resetButton.addEventListener('click', () => {
  state.searchQuery = '';
  state.selectedSize = 'all';
  state.selectedCoat = 'all';
  state.sortBy = 'name-asc';

  searchInput.value = '';
  sizeFilter.value = 'all';
  coatFilter.value = 'all';
  sortSelect.value = 'name-asc';

  render();
});


/* Блок 8. Удаление */

cardsContainer.addEventListener('click', e => {
  const deleteBtn = e.target.closest('[data-action="delete"]');
  if (!deleteBtn) return;

  const card = deleteBtn.closest('.card');
  if (!card) return;

  const id = card.dataset.id;

  const item = state.items.find(i => i.id === id);
  if (!item) return;

  if (!window.confirm(`Удалить «${item.name}» из каталога?`)) return;

  /* Иммутабельное удаление: новый массив без удаляемой породы */
  state.items = state.items.filter(i => i.id !== id);
  saveItems();
  render();
});


/* Блок 9. Модальное окно: открытие и закрытие */

/* Запоминаем, куда вернуть фокус после закрытия */
let lastFocusedElement = null;

function openModal() {
  lastFocusedElement = document.activeElement;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  const firstInput = form.querySelector('input, select, textarea');
  if (firstInput) firstInput.focus();
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
  form.reset();
  clearErrors();
  resetImagePreview();
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
}

/* Кнопка «Добавить новую породу» */
addButton.addEventListener('click', openModal);

/* Делегирование: клик по элементу с data-close закрывает модалку */
modal.addEventListener('click', e => {
  if (e.target.closest('[data-close]')) closeModal();
});

/* Escape закрывает модалку, если она открыта */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !modal.hidden) closeModal();
});


/* Блок 10. Клиентская валидация формы */

/* Убирает все сообщения об ошибках и красные подсветки */
function clearErrors() {
  form.querySelectorAll('.error').forEach(el => {
    el.textContent = '';
  });
  form.querySelectorAll('.is-invalid').forEach(el => {
    el.classList.remove('is-invalid');
  });
}

/* Показывает ошибку у конкретного поля */
function showError(input, message) {
  input.classList.add('is-invalid');
  const target = form.querySelector(`[data-error-for="${input.id}"]`);
  if (target) target.textContent = message;
}

/* Проверяет одно поле через input.validity */
function validateField(input) {
  if (input.validity.valid) return true;

  if (input.validity.valueMissing) {
    showError(input, 'Заполните это поле');
  } else if (input.validity.tooShort) {
    showError(input, `Минимум ${input.minLength} символов`);
  } else if (input.validity.tooLong) {
    showError(input, `Максимум ${input.maxLength} символов`);
  } else if (input.validity.rangeUnderflow) {
    showError(input, `Значение не меньше ${input.min}`);
  } else if (input.validity.rangeOverflow) {
    showError(input, `Значение не больше ${input.max}`);
  } else if (input.validity.badInput) {
    showError(input, 'Введите число');
  } else if (input.validity.stepMismatch) {
    showError(input, 'Недопустимый шаг значения');
  } else {
    showError(input, 'Проверьте значение');
  }

  return false;
}

/* Проверяет всю форму; true — если все поля валидны */
function validateForm() {
  clearErrors();
  let valid = true;

  const inputs = form.querySelectorAll('input, select, textarea');

  inputs.forEach(input => {
    if (input.type === 'checkbox' || input.disabled) return;
    if (!validateField(input)) valid = false;
  });

  return valid;
}

/* Снимаем ошибку, как только пользователь исправил поле */
form.addEventListener('input', e => {
  const input = e.target;
  if (!input.classList.contains('is-invalid')) return;
  if (input.validity.valid) {
    input.classList.remove('is-invalid');
    const target = form.querySelector(`[data-error-for="${input.id}"]`);
    if (target) target.textContent = '';
  }
});


/* Блок 11. Отправка формы — добавление новой породы */

form.addEventListener('submit', e => {
  e.preventDefault();

  if (!validateForm()) return;

  const data = new FormData(form);

  /* Собираем объект новой породы из данных формы */
  const newItem = {
    id: 'breed-' + Date.now(),
    name: String(data.get('name')).trim(),
    country: String(data.get('country')).trim(),
    size: String(data.get('size')),
    coat: String(data.get('coat')),
    weightMax: Number(data.get('weightMax')),
    lifespan: String(data.get('lifespan') || '').trim() || '—',
    description: String(data.get('description')).trim(),
    kidsFriendly: data.get('kidsFriendly') === 'on',
    image: currentImageDataUrl || PLACEHOLDER_IMAGE
  };

  /* Иммутабельное добавление в начало массива */
  state.items = [newItem, ...state.items];
  saveItems();
  render();
  closeModal();

  /* Прокручиваем к карточкам, чтобы пользователь увидел результат */
  const breedsSection = document.getElementById('breeds');
  if (breedsSection) {
    breedsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});


/* Блок 12. Scroll-spy — подсветка активного пункта меню */

(function initScrollSpy() {
  const links = Array.from(document.querySelectorAll('.main-nav a[href^="#"]'));
  const sections = links
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (sections.length === 0) return;

  /* Определяет текущую секцию и ставит .is-active на нужную ссылку */
  function setActive() {
    const probe = window.scrollY + 140;
    let current = sections[0];

    sections.forEach(section => {
      if (section.offsetTop <= probe) current = section;
    });

    links.forEach(link => {
      const href = link.getAttribute('href');
      const isActive = current && href === '#' + current.id;
      link.classList.toggle('is-active', Boolean(isActive));
    });
  }

  window.addEventListener('scroll', setActive, { passive: true });
  window.addEventListener('resize', setActive);
  window.addEventListener('load', setActive);
  setActive();
})();


/* Блок 13. Первая отрисовка при загрузке страницы */

render();