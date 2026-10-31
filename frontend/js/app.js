'use strict';
const API_URL = 'http://127.0.0.1:8000/api/breeds';

/* Блок 1. Утилиты */

/* Заглушка для фото */
const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#e3e6d5"/>
      <text x="200" y="155" text-anchor="middle"
            font-family="sans-serif" font-size="20" fill="#6b7d55">Фото</text>
    </svg>`
  );

/* Словари для перевода технических значений */
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

function sizeLabel(size) {
  return SIZE_LABELS[size] || size;
}

function coatLabel(coat) {
  return COAT_LABELS[coat] || coat;
}


/* Блок 2. Состояние приложения (State) */

const state = {
  items: [],             // Сюда загрузятся данные с сервера
  searchQuery: '',
  selectedSize: 'all',
  selectedCoat: 'all',
  sortBy: 'name-asc'
};

/* Функция загрузки данных с сервера (GET) */
async function loadBreeds() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Ошибка загрузки данных');

    state.items = await response.json();
    render(); // Перерисовываем интерфейс, когда данные пришли
  } catch (error) {
    console.error(error);
    alert('Не удалось загрузить данные с сервера. Проверьте, запущен ли backend.');
  }
}


/* Блок 3. Производные данные: поиск + фильтр + сортировка (работает на клиенте) */

function getVisibleItems() {
  const query = state.searchQuery.trim().toLowerCase();

  /* Фильтр */
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
      sorted.sort((a, b) => (a.weight_max || 0) - (b.weight_max || 0));
      break;
    case 'weight-desc':
      sorted.sort((a, b) => (b.weight_max || 0) - (a.weight_max || 0));
      break;
    default:
      break;
  }

  return sorted;
}

/* Блок 4. Ссылки на DOM-элементы */

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


/* Блок 5. Работа с фото в форме (перевод в Base64 для отправки на сервер) */

const MAX_IMAGE_SIZE = 1024 * 1024; // 1 МБ
let currentImageDataUrl = '';

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

function resetImagePreview() {
  currentImageDataUrl = '';
  imagePreviewImg.removeAttribute('src');
  imagePreview.hidden = true;
  imageInput.value = '';
}

function clearImageError() {
  imageInput.classList.remove('is-invalid');
  const target = form.querySelector('[data-error-for="f-image"]');
  if (target) target.textContent = '';
}

imageInput.addEventListener('change', e => {
  const file = e.target.files && e.target.files[0];
  handleImageSelect(file);
});

imageRemoveBtn.addEventListener('click', () => {
  resetImagePreview();
});


/* Блок 6. Render — отрисовка карточек */

function createCardElement(item) {
  const card = document.createElement('article');
  card.className = 'card';
  card.dataset.id = item.id;

  /* Картинка породы */
  const img = document.createElement('img');
  // Бэкенд возвращает image_url, но на всякий случай проверяем и image
  img.src = item.image_url || item.image || PLACEHOLDER_IMAGE;
  img.alt = item.name;
  img.loading = 'lazy';
  img.addEventListener('error', () => {
    img.src = PLACEHOLDER_IMAGE;
  });
  card.appendChild(img);

  const title = document.createElement('h3');
  title.textContent = item.name;
  card.appendChild(title);

  const desc = document.createElement('p');
  desc.textContent = item.description;
  card.appendChild(desc);

  const props = document.createElement('ul');
  props.className = 'card-props';

  // Бэкенд отдает weight_max и kids_friendly, поэтому используем их
  const rows = [
    ['Страна', item.country],
    ['Размер', sizeLabel(item.size)],
    ['Шерсть', coatLabel(item.coat)],
    ['Вес', `до ${item.weight_max || item.weightMax || 0} кг`],
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

  // Контейнер для кнопок (Изменить и Удалить)
  const btnContainer = document.createElement('div');
  btnContainer.style.display = 'flex';
  btnContainer.style.justifyContent = 'flex-end';
  btnContainer.style.gap = '10px';
  btnContainer.style.marginTop = '0.75rem';

  // Кнопка изменения
  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'card__delete'; // Используем те же стили, что и для удаления
  editBtn.dataset.action = 'edit';
  editBtn.textContent = 'Изменить';
  editBtn.style.color = 'var(--accent-darker)';
  editBtn.style.borderColor = 'var(--accent-darker)';
  btnContainer.appendChild(editBtn);

  // Кнопка удаления
  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'card__delete';
  deleteBtn.dataset.action = 'delete';
  deleteBtn.textContent = 'Удалить';
  btnContainer.appendChild(deleteBtn);

  card.appendChild(btnContainer);

  return card;
}

function render() {
  const items = getVisibleItems();

  cardsContainer.textContent = '';

  if (items.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'Ничего не найдено или база данных пуста. Добавьте породу!';
    cardsContainer.appendChild(empty);
  } else {
    const fragment = document.createDocumentFragment();
    items.forEach(item => fragment.appendChild(createCardElement(item)));
    cardsContainer.appendChild(fragment);
  }

  const total = state.items.length;
  const shown = items.length;
  filterCountEl.textContent =
    shown === total
      ? `Показано пород: ${shown}`
      : `Найдено: ${shown} из ${total}`;
}

/* Блок 7. Обработчики поиска, фильтров, сортировки, сброса (работают локально) */

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

/* Блок 8. Удаление и Изменение (DELETE и PATCH) */

cardsContainer.addEventListener('click', async e => {
  const card = e.target.closest('.card');
  if (!card) return;

  const id = card.dataset.id;

  // Обработка кнопки "Изменить"
  const editBtn = e.target.closest('[data-action="edit"]');
  if (editBtn) {
    const item = state.items.find(i => String(i.id) === String(id));
    if (!item) return;

    // Спрашиваем новое название (обновляем хотя бы одно поле - name)
    const newName = prompt('Введите новое название для породы:', item.name);

    if (!newName || newName.trim() === '' || newName === item.name) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      });

      if (!response.ok) throw new Error('Ошибка обновления');
      await loadBreeds(); // Обновляем данные с сервера
    } catch (err) {
      alert('Не удалось обновить название');
    }
    return;
  }

  // Обработка кнопки "Удалить"
  const deleteBtn = e.target.closest('[data-action="delete"]');
  if (deleteBtn) {
    if (!window.confirm('Удалить эту породу из базы данных?')) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (response.ok || response.status === 204) {
        await loadBreeds(); // Обновляем данные с сервера
      } else {
        throw new Error('Ошибка удаления');
      }
    } catch (err) {
      alert('Ошибка при удалении породы');
    }
  }
});

/* Блок 9. Модальное окно: открытие и закрытие */

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

addButton.addEventListener('click', openModal);

modal.addEventListener('click', e => {
  if (e.target.closest('[data-close]')) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !modal.hidden) closeModal();
});

/* Блок 10. Валидация формы */

function clearErrors() {
  form.querySelectorAll('.error').forEach(el => {
    el.textContent = '';
  });
  form.querySelectorAll('.is-invalid').forEach(el => {
    el.classList.remove('is-invalid');
  });
}

function showError(input, message) {
  input.classList.add('is-invalid');
  const target = form.querySelector(`[data-error-for="${input.id}"]`);
  if (target) target.textContent = message;
}

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
  } else {
    showError(input, 'Проверьте значение');
  }
  return false;
}

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

form.addEventListener('input', e => {
  const input = e.target;
  if (!input.classList.contains('is-invalid')) return;
  if (input.validity.valid) {
    input.classList.remove('is-invalid');
    const target = form.querySelector(`[data-error-for="${input.id}"]`);
    if (target) target.textContent = '';
  }
});


/* Блок 11. Отправка формы — добавление новой породы (POST) */

form.addEventListener('submit', async e => {
  e.preventDefault();

  if (!validateForm()) return;

  const data = new FormData(form);

  // Собираем объект новой породы.
  // Отправляем поля с именами, которые ожидает Pydantic (weightMax, kidsFriendly, image)
  const newItem = {
    name: String(data.get('name')).trim(),
    country: String(data.get('country')).trim(),
    size: String(data.get('size')),
    coat: String(data.get('coat')),
    weightMax: Number(data.get('weightMax')),
    lifespan: String(data.get('lifespan') || '').trim() || '—',
    description: String(data.get('description')).trim(),
    kidsFriendly: data.get('kidsFriendly') === 'on',
    image: currentImageDataUrl || '' // Если фото нет, отправляем пустую строку
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    });

    if (!response.ok) throw new Error('Ошибка создания');

    closeModal();
    await loadBreeds(); // Перезапрашиваем данные с сервера

    // Прокручиваем к карточкам
    const breedsSection = document.getElementById('breeds');
    if (breedsSection) {
      breedsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } catch (err) {
    alert('Ошибка при добавлении породы. Проверьте корректность данных.');
    console.error(err);
  }
});

/* Блок 12. Подсветка активного пункта меню */

(function initScrollSpy() {
  const links = Array.from(document.querySelectorAll('.main-nav a[href^="#"]'));
  const sections = links
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (sections.length === 0) return;

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


/* Блок 13. Инициализация при загрузке страницы */
// Запускаем загрузку данных с бэкенда
loadBreeds();