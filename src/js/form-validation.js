export function showFieldError(inputElement, errorElement, message) {
  if (inputElement) {
    
    const errorClass = inputElement.classList.contains('rating-modal__textarea')
      ? 'rating-modal__textarea--error'
      : inputElement.classList.contains('rating-modal__input')
      ? 'rating-modal__input--error'
      : inputElement.classList.contains('footer__subscribe-form-input')
      ? 'footer__subscribe-form-input--error'
      : 'form-field--error';

    inputElement.classList.add(errorClass);
  }

  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('form-error--visible');
  }
}

export function hideFieldError(inputElement, errorElement) {
  if (inputElement) {
    inputElement.classList.remove(
      'rating-modal__input--error',
      'rating-modal__textarea--error',
      'footer__subscribe-form-input--error',
      'form-field--error'
    );
  }

  if (errorElement) {
    errorElement.textContent = '';
    errorElement.classList.remove('form-error--visible');
  }
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
