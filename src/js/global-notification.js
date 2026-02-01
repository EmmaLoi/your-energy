let notificationTimeout = null;

export function showGlobalNotification(message, type = 'success') {
  const notification = document.getElementById('js-global-notification');
  const textElement = document.getElementById('js-global-notification-text');

  if (!notification || !textElement) {
    return;
  }

  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
    notificationTimeout = null;
  }

  textElement.textContent = message;
  notification.classList.remove('global-notification--error');
  if (type === 'error') {
    notification.classList.add('global-notification--error');
  }

  notification.classList.add('global-notification--visible');

  notificationTimeout = setTimeout(() => {
    hideGlobalNotification();
  }, 3000);
}

function hideGlobalNotification() {
  const notification = document.getElementById('js-global-notification');
  const textElement = document.getElementById('js-global-notification-text');

  if (!notification) {
    return;
  }

  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
    notificationTimeout = null;
  }

  notification.classList.remove('global-notification--visible');

  setTimeout(() => {
    if (textElement) {
      textElement.textContent = '';
    }
    notification.classList.remove('global-notification--error');
  }, 300);
}

export function initGlobalNotification() {
  const closeBtn = document.getElementById('js-global-notification-close');

  if (closeBtn) {
    closeBtn.addEventListener('click', hideGlobalNotification);
  }
}
