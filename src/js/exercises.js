import { byId, delegate, on, qs, qsa, setText } from './core/dom.js';
import { fetchJson } from './core/api.js';
import { getFavorites, isFavorite, removeFromFavorites } from './favorites.js';
import { openExerciseModal } from './exercise-modal.js';

const UI = {
  cards: '.exercises__cards',
  pagination: '.exercises__pagination',
  filters: '.exercises__filter',
  searchWrap: '#js-exercises-search',
  searchInput: '#js-exercises-search-input',
  breadcrumbs: '#js-exercises-breadcrumbs',
  homeHero: '.home__hero',
  controls: '.exercises__controls',
  sidebarImage: '.exercises__aside-image',
  dailyNorm: '.exercises__norm',
  favoritesPromo: '.exercises__favorites-promo',
  exercisesBlock: '.exercises',
  homeBlock: '.home',
};

const state = {
  filter: 'Muscles',
  page: 1,
  category: null,
  search: '',
  mode:  ('home'),
};

function showSearch() {
  const wrap = qs(UI.searchWrap);
  if (wrap) {
    wrap.style.display = 'flex';
  }
}

function hideSearch() {
  const wrap = qs(UI.searchWrap);
  const input = qs(UI.searchInput);
  if (wrap) {
    wrap.style.display = 'none';
  }
  if (input) {
    input.value = '';
  }
  state.search = '';
}

function setHomeLayoutVisible(isHome) {
  const hero = qs(UI.homeHero);
  const controls = qs(UI.controls);
  const sidebarImage = qs(UI.sidebarImage);
  const dailyNorm = qs(UI.dailyNorm);
  const favoritesPromo = qs(UI.favoritesPromo);
  const home = qs(UI.homeBlock);
  const exercises = qs(UI.exercisesBlock);

  if (hero) {
    hero.style.display = isHome ? 'flex' : 'none';
  }
  if (controls) {
    controls.style.display = isHome ? 'flex' : 'none';
  }
  if (sidebarImage) {
    sidebarImage.style.display = isHome ? 'block' : 'none';
  }
  if (dailyNorm) {
    dailyNorm.style.display = isHome ? 'flex' : 'none';
  }
  if (favoritesPromo) {
    favoritesPromo.style.display = isHome ? 'none' : 'grid';
  }

  if (home) {
    home.classList.toggle('home--favorites', !isHome);
  }
  if (exercises) {
    exercises.classList.toggle('exercises--favorites', !isHome);
  }
}

function setFiltersActive(filter) {
  qsa(UI.filters).forEach(btn => {
    btn.classList.toggle('exercises__filter--active', btn.getAttribute('data-filter') === filter);
  });
}

function renderCards(html, isItemsView) {
  const cards = qs(UI.cards);
  if (!cards) {
    return;
  }
  cards.classList.toggle('exercises__cards--items', Boolean(isItemsView));
  cards.innerHTML = html;
}

function renderEmptyState(message) {
  renderCards(
    `
    <div class="exercises__empty-state">
      <p class="exercises__empty-text">${message}</p>
    </div>
  `,
    true,
  );
}

function clearPagination() {
  const pagination = qs(UI.pagination);
  if (pagination) {
    pagination.innerHTML = '';
  }
}

function renderPagination(totalPages, currentPage) {
  const pagination = qs(UI.pagination);
  if (!pagination) return;
  pagination.innerHTML = '';

  if (!totalPages || totalPages <= 1) {
    return;
  }

  const go = page => {
    state.page = page;
    if (state.mode === 'favorites') {
      return;
    }
    if (state.category) {
      loadExercises(state.category, page, state.search);
    } else {
      loadCategories(state.filter, page);
    }
  };

  const btn = (label, disabled, onClick, className) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = className;
    b.disabled = disabled;
    b.innerHTML = label;
    b.addEventListener('click', onClick);
    return b;
  };

  pagination.appendChild(
    btn('&laquo;', currentPage === 1, () => go(1), 'exercises__pagination-arrow'),
  );
  pagination.appendChild(
    btn('&lsaquo;', currentPage === 1, () => go(currentPage - 1), 'exercises__pagination-arrow'),
  );

  const pageBtn = page => {
    const b = btn(String(page), false, () => go(page), 'exercises__pagination-page');
    if (page === currentPage) {
      b.classList.add('exercises__pagination-page--active');
    }
    return b;
  };

  if (totalPages <= 5) {
    for (let p = 1; p <= totalPages; p += 1) pagination.appendChild(pageBtn(p));
  } else {
    if (currentPage > 2) {
      pagination.appendChild(pageBtn(currentPage - 2));
      pagination.appendChild(pageBtn(currentPage - 1));
    }

    pagination.appendChild(pageBtn(currentPage));

    const ellipsis = document.createElement('span');
    ellipsis.className = 'exercises__pagination-ellipsis';
    ellipsis.textContent = '...';
    pagination.appendChild(ellipsis);

    pagination.appendChild(pageBtn(totalPages - 1));
    pagination.appendChild(pageBtn(totalPages));
  }

  pagination.appendChild(
    btn('&rsaquo;', currentPage === totalPages, () => go(currentPage + 1), 'exercises__pagination-arrow'),
  );
  pagination.appendChild(
    btn('&raquo;', currentPage === totalPages, () => go(totalPages), 'exercises__pagination-arrow'),
  );
}

function categoryCardTemplate(item) {
  return `
    <li class="exercise-card" data-category-name="${item.name}">
      <div class="exercise-card__image">
        <img src="${item.imgURL}" alt="${item.name} exercise" loading="lazy" decoding="async" />
        <div class="exercise-card__overlay">
          <div class="exercise-card__overlay-name">${item.name}</div>
          <div class="exercise-card__overlay-category">${item.filter}</div>
        </div>
      </div>
    </li>
  `;
}

function exerciseCardTemplate(exercise) {
  const rating = Number(exercise.rating || 0);
  const burnedCalories = Number(exercise.burnedCalories || 0);
  const time = Number(exercise.time || 0);
  const bodyPart = exercise.bodyPart || '';
  const target = exercise.target || '';
  const id = exercise._id || '';
  const isFavoritesView = state.mode === 'favorites';

  const deleteButton = isFavoritesView
    ? `
      <button class="exercise-card__delete" type="button" aria-label="Remove from favorites">
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M10.6667 4.00004V3.46671C10.6667 2.71997 10.6667 2.3466 10.5213 2.06139C10.3935 1.8105 10.1895 1.60653 9.93865 1.4787C9.65344 1.33337 9.28007 1.33337 8.53333 1.33337H7.46667C6.71993 1.33337 6.34656 1.33337 6.06135 1.4787C5.81046 1.60653 5.60649 1.8105 5.47866 2.06139C5.33333 2.3466 5.33333 2.71997 5.33333 3.46671V4.00004M6.66667 7.66671V11M9.33333 7.66671V11M2 4.00004H14M12.6667 4.00004V11.4667C12.6667 12.5868 12.6667 13.1469 12.4487 13.5747C12.2569 13.951 11.951 14.257 11.5746 14.4487C11.1468 14.6667 10.5868 14.6667 9.46667 14.6667H6.53333C5.41323 14.6667 4.85318 14.6667 4.42535 14.4487C4.04903 14.257 3.74307 13.951 3.55132 13.5747C3.33333 13.1469 3.33333 12.5868 3.33333 11.4667V4.00004" stroke="#242424" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>\n</svg>
      </button>
    `
    : '';

  return `
    <li class="exercise-card exercise-card--details" data-exercise-id="${id}">
      <div class="exercise-card__header">
        <button class="exercise-card__badge" type="button">WORKOUT</button>
        ${deleteButton}
        <div class="exercise-card__rating">
          <span class="exercise-card__rating-value">${rating.toFixed(1)}</span>
          <svg class="exercises__content__main__cards-item-rating-star" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 0L11.0206 6.21885L17.5595 6.21885L12.2694 10.0623L14.2901 16.2812L9 12.4377L3.70993 16.2812L5.73056 10.0623L0.440492 6.21885L6.97937 6.21885L9 0Z" fill="#EEA10C"/>
          </svg>
        </div>
        <button class="exercise-card__start" type="button">
          Start
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.75 4.5L11.25 9L6.75 13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="exercise-card__body">
        <div class="exercise-card__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3 class="exercise-card__title">${exercise.name}</h3>
      </div>
      <div class="exercise-card__footer">
        <div class="exercise-card__info">
          <span class="exercise-card__info-label">Burned calories:</span>
          <span class="exercise-card__info-value">${burnedCalories}</span>
          <span class="exercise-card__info-label">/ ${time} min</span>
        </div>
        <div class="exercise-card__info">
          <span class="exercise-card__info-label">Body part:</span>
          <span class="exercise-card__info-value">${bodyPart}</span>
        </div>
        <div class="exercise-card__info">
          <span class="exercise-card__info-label">Target:</span>
          <span class="exercise-card__info-value">${target}</span>
        </div>
      </div>
    </li>
  `;
}

function updateBreadcrumbs(categoryName = null) {
  const container = qs(UI.breadcrumbs);
  if (!container) {
    return;
  }
  container.innerHTML = '';

  if (state.mode === 'favorites') {
    const li = document.createElement('li');
    li.className = 'exercises__breadcrumb-item exercises__breadcrumb-item--active';
    li.textContent = 'Favorites';
    li.setAttribute('data-breadcrumb', 'favorites');
    container.appendChild(li);
    return;
  }

  const exercises = document.createElement('li');
  exercises.className = 'exercises__breadcrumb-item';
  exercises.textContent = 'Exercises';
  exercises.setAttribute('data-breadcrumb', 'exercises');
  if (!categoryName) {
    exercises.classList.add('exercises__breadcrumb-item--active');
  }
  on(exercises, 'click', () => {
    state.category = null;
    state.page = 1;
    loadExerciseCards(state.filter, 1);
  });
  container.appendChild(exercises);

  if (categoryName) {
    const sep = document.createElement('li');
    sep.className = 'exercises__breadcrumb-separator';
    sep.textContent = '/';
    container.appendChild(sep);

    const category = document.createElement('li');
    category.className = 'exercises__breadcrumb-item exercises__breadcrumb-item--active';
    category.textContent = categoryName;
    container.appendChild(category);
  }
}

async function loadCategories(filter, page = 1) {
  const encodedFilter = encodeURIComponent(filter);
  const data = await fetchJson(`/filters?filter=${encodedFilter}&page=${page}`);

  const list = data?.results || data?.exercises || data || [];
  const totalPages = data?.totalPages || data?.total_pages || data?.pageCount || 1;

  updateBreadcrumbs(null);
  hideSearch();

  if (Array.isArray(list) && list.length) {
    const html = list.map(categoryCardTemplate).join('');
    renderCards(html, false);
    renderPagination(totalPages, page);
  } else {
    renderCards('', false);
    clearPagination();
  }
}

async function loadExercises(categoryName, page = 1, keyword = state.search) {
  if (!state.filter || !categoryName) {
    console.warn('Filter and category are required, request skipped');
    return;
  }

  showSearch();

  const filterKeyMap = {
    Muscles: 'muscles',
    'Body parts': 'bodypart',
    Equipment: 'equipment',
  };

  const filterKey = filterKeyMap[state.filter];
  if (!filterKey) {
    console.warn('Unknown filter type, request skipped');
    return;
  }

  const params = new URLSearchParams();
  params.set(filterKey, categoryName);
  params.set('page', String(page));
  params.set('limit', '10');
  if (keyword && String(keyword).trim()) {
    params.set('keyword', String(keyword).trim());
  }

  const data = await fetchJson(`/exercises?${params.toString()}`);
  const list = data?.results || [];
  const totalPages = data?.totalPages || 1;

  if (!list.length) {
    renderEmptyState('No exercises found');
    clearPagination();
    return;
  }

  const html = list.map(exerciseCardTemplate).join('');
  renderCards(html, true);
  renderPagination(totalPages, page);

  state.page = page;
}


export async function loadFavoritesExercises() {
  state.mode = 'favorites';
  updateBreadcrumbs(null);
  hideSearch();
  clearPagination();

  const favoriteIds = getFavorites();
  if (!favoriteIds.length) {
    renderEmptyState(
      "It appears that you haven't added any exercises to your favorites yet. To get started, add exercises you like to your favorites for easier access in the future.",
    );
    return;
  }

  const exercises = await Promise.all(
    favoriteIds.map(async id => {
      try {
        return await fetchJson(`/exercises/${id}`);
      } catch {
        return null;
      }
    }),
  );

  const valid = exercises.filter(Boolean);
  if (valid.length) {
    renderCards(valid.map(exerciseCardTemplate).join(''), true);
  } else {
    renderEmptyState(
      "It appears that you haven't added any exercises to your favorites yet. To get started, add exercises you like to your favorites for easier access in the future.",
    );
  }
}

export function loadExerciseCards(filter, page = 1) {
  state.filter = filter;
  state.page = page;
  state.category = null;
  state.search = '';
  state.mode = 'home';
  setFiltersActive(filter);
  return loadCategories(filter, page);
}

function loadExercisesByCategory(categoryName, page = 1, keyword = state.search) {
  state.category = categoryName;
  state.page = page;
  state.search = keyword || '';
  state.mode = 'home';
  return loadExercises(categoryName, page, state.search);
}

export function showHomeView() {
  state.mode = 'home';
  state.category = null;
  state.search = '';
  setHomeLayoutVisible(true);
  loadExerciseCards(state.filter, 1);
}

export function showFavoritesView() {
  state.mode = 'favorites';
  state.category = null;
  state.search = '';
  setHomeLayoutVisible(false);
  loadFavoritesExercises();
}

function initSearch() {
  const input = qs(UI.searchInput);
  if (!input) {
    return;
  }
  let timer = null;

  on(input, 'input', () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      const keyword = input.value.trim();
      if (state.category) {
        loadExercisesByCategory(state.category, 1, keyword);
      }
    }, 350);
  });
}

function initFilters() {
  delegate(document, 'click', UI.filters, (e, button) => {
    const filter = button.getAttribute('data-filter');
    if (!filter) {
      return;
    }
    setFiltersActive(filter);
    updateBreadcrumbs(null);
    loadExerciseCards(filter, 1);
  });
}

function initCardsClickHandling() {
  const cards = qs(UI.cards);
  if (!cards) {
    return;
  }

  delegate(cards, 'click', '.exercise-card', (e, card) => {

    const category = card.getAttribute('data-category-name');
    if (category) {
      loadExercisesByCategory(category, 1);
      return;
    }


    const deleteButton = e.target instanceof Element ? e.target.closest('.exercise-card__delete') : null;
    if (deleteButton) {
      const exerciseId = card.getAttribute('data-exercise-id');
      if (exerciseId && isFavorite(exerciseId)) {
        removeFromFavorites(exerciseId);
        card.remove();
      }
      return;
    }


    const exerciseId = card.getAttribute('data-exercise-id');
    if (exerciseId) {
      openExerciseModal(exerciseId);
    }
  });
}

export function initExercises() {
  initFilters();
  initSearch();
  initCardsClickHandling();


  setFiltersActive(state.filter);
}

