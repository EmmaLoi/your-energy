import { byId, on, qs, qsa, setAttr, setText } from './core/dom.js';
import { fetchJson } from './core/api.js';
import { openRatingModal } from './rating-modal.js';
import { isFavorite, toggleFavorite } from './favorites.js';
import { getActivePage } from './header.js';
import { loadFavoritesExercises } from './exercises.js';

let activeExerciseId = null;

function getModal() {
  return byId('js-exercise-modal');
}

export function closeExerciseModal() {
  const modal = getModal();
  if (!modal) {
    return;
  }
  modal.classList.remove('exercise-modal--open');
  document.body.style.overflow = '';
  activeExerciseId = null;
}

function setFavoriteButtonState(exerciseId) {
  const button = byId('js-exercise-modal-favorites');
  if (!button) {
    return;
  }

  const inFavorites = isFavorite(exerciseId);
  const textNode = button.querySelector('span');
  const iconPath = button.querySelector('svg path');

  button.classList.toggle('active', inFavorites);

  if (textNode) {
    textNode.textContent = inFavorites ? 'Remove from favorites' : 'Add to favorites';
  }
  if (!iconPath) {
    return;
  }

  if (inFavorites) {
    setAttr(iconPath, 'fill', 'currentColor');
    iconPath.removeAttribute('stroke');
    iconPath.removeAttribute('stroke-width');
  } else {
    setAttr(iconPath, 'fill', 'none');
    setAttr(iconPath, 'stroke', 'currentColor');
    setAttr(iconPath, 'stroke-width', '2');
  }
}

function renderStars(container, ratingValue) {
  if (!container) {
    return;
  }
  const stars = qsa('.exercise-modal__rating-star', container);
  const rating = Math.round(Number(ratingValue || 0));

  stars.forEach((star, index) => {
    const path = star.querySelector('path');
    if (!path) {
      return;
    }

    if (index < rating) {
      setAttr(path, 'fill', '#EEA10C');
      path.removeAttribute('stroke');
      path.removeAttribute('stroke-width');
    } else {
      setAttr(path, 'fill', 'none');
      setAttr(path, 'stroke', 'rgba(255,255,255,0.3)');
      setAttr(path, 'stroke-width', '1.5');
    }
  });
}

function resetModalContent() {
  const image = byId('js-exercise-modal-image');
  const title = byId('js-exercise-modal-title');
  const ratingValue = qs('.exercise-modal__rating-value');
  const ratingStars = qs('.exercise-modal__rating-stars');
  const target = byId('js-exercise-modal-target');
  const bodyPart = byId('js-exercise-modal-body-part');
  const equipment = byId('js-exercise-modal-equipment');
  const popular = byId('js-exercise-modal-popular');
  const calories = byId('js-exercise-modal-calories');
  const time = byId('js-exercise-modal-time');
  const description = byId('js-exercise-modal-description');

  setText(title, 'Loading...');
  setText(ratingValue, '0.0');
  setText(target, '');
  setText(bodyPart, '');
  setText(equipment, '');
  setText(popular, '0');
  setText(calories, '0');
  setText(time, '/0 min');
  setText(description, '');
  if (image) {
    image.src = '';
  }
  renderStars(ratingStars, 0);
}

function fillModalContent(exercise) {
  const image = byId('js-exercise-modal-image');
  const title = byId('js-exercise-modal-title');
  const ratingValue = qs('.exercise-modal__rating-value');
  const ratingStars = qs('.exercise-modal__rating-stars');
  const target = byId('js-exercise-modal-target');
  const bodyPart = byId('js-exercise-modal-body-part');
  const equipment = byId('js-exercise-modal-equipment');
  const popular = byId('js-exercise-modal-popular');
  const calories = byId('js-exercise-modal-calories');
  const time = byId('js-exercise-modal-time');
  const description = byId('js-exercise-modal-description');

  if (image) {
    image.src = exercise.gifUrl || '';
  }
  setText(title, exercise.name || '');
  setText(target, exercise.target || '');
  setText(bodyPart, exercise.bodyPart || '');
  setText(equipment, exercise.equipment || '');
  setText(popular, exercise.popularity || 0);
  setText(calories, exercise.burnedCalories || 0);
  setText(time, `/${exercise.time || 0} min`);
  setText(description, exercise.description || '');

  const rating = Number(exercise.rating || 0);
  setText(ratingValue, rating.toFixed(1));
  renderStars(ratingStars, rating);
}

export async function openExerciseModal(exerciseId) {
  const modal = getModal();
  if (!modal) {
    return;
  }

  activeExerciseId = exerciseId;
  modal.classList.add('exercise-modal--open');
  document.body.style.overflow = 'hidden';

  resetModalContent();

  try {
    const exercise = await fetchJson(`/exercises/${exerciseId}`);

    if (activeExerciseId !== exerciseId) {
      return;
    }
    fillModalContent(exercise);
    setFavoriteButtonState(exerciseId);
  } catch {
    const title = byId('js-exercise-modal-title');
    const description = byId('js-exercise-modal-description');
    setText(title, 'Error loading exercise');
    setText(description, 'Failed to load exercise details. Please try again later.');
  }
}

export function initExerciseModal() {
  const modal = getModal();
  if (!modal) {
    return;
  }

  const closeBtn = byId('js-exercise-modal-close');
  const overlay = modal.querySelector('.exercise-modal__overlay');

  on(closeBtn, 'click', closeExerciseModal);
  on(overlay, 'click', closeExerciseModal);


  on(byId('js-exercise-modal-favorites'), 'click', () => {
    if (!activeExerciseId) {
      return;
    }
    const wasAdded = toggleFavorite(activeExerciseId);
    setFavoriteButtonState(activeExerciseId);

    if (!wasAdded && getActivePage() === 'favorites') {
      closeExerciseModal();
      loadFavoritesExercises();
    }
  });


  on(byId('js-exercise-modal-rating-btn'), 'click', () => {
    if (!activeExerciseId) {
      return;
    }
    const exerciseId = activeExerciseId;
    closeExerciseModal();
    openRatingModal(exerciseId);
  });
}
