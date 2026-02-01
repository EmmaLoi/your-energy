import { fetchJson } from './js/core/api.js';
import { on } from './js/core/dom.js';

import { initExercises, loadExerciseCards } from './js/exercises.js';
import { initExerciseModal, closeExerciseModal } from './js/exercise-modal.js';
import { initRatingModal, closeRatingModal } from './js/rating-modal.js';
import { initGlobalNotification, showGlobalNotification } from './js/global-notification.js';
import { hideFieldError, showFieldError, validateEmail } from './js/form-validation.js';
import { initHeader } from './js/header.js';
import { displayQuote } from './js/quote.js';

displayQuote();

async function subscribeToNewsletter(email) {
  try {
    const payload = await fetchJson('/subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    });
    return { ok: true, message: payload?.message || 'Subscribed!' };
  } catch (err) {
    
    if (err?.status === 409) return { ok: false, message: 'Email already exist' };
    return { ok: false, message: err?.message || 'Something wrong. Failed to subscribe' };
  }
}

function initNewsletterForm() {
  const form = document.getElementById('subscribeForm');
  const emailInput = document.getElementById('subscribeEmail');
  const emailError = document.getElementById('subscribeEmailError');

  if (!form || !emailInput || !emailError) return;

  on(emailInput, 'input', () => hideFieldError(emailInput, emailError));

  on(form, 'submit', async e => {
    e.preventDefault();

    const email = emailInput.value.trim();
    if (!email) {
      showFieldError(emailInput, emailError, 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      showFieldError(emailInput, emailError, 'Please enter a valid email address');
      return;
    }

    hideFieldError(emailInput, emailError);

    const result = await subscribeToNewsletter(email);
    showGlobalNotification(result.message, result.ok ? 'success' : 'error');

    if (result.ok) {
      form.reset();
      hideFieldError(emailInput, emailError);
    }
  });
}

function initEscapeClose() {
  on(document, 'keydown', e => {
    if (e.key !== 'Escape') return;
    closeExerciseModal();
    closeRatingModal();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initExerciseModal();
  initRatingModal();
  initGlobalNotification();
  initHeader();
  initExercises();
  initNewsletterForm();
  initEscapeClose();

  
  loadExerciseCards('Muscles', 1);
});
