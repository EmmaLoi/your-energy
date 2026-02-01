import { qs, qsa, on, delegate } from './core/dom.js';
import { readJson, writeJson } from './core/storage.js';
import { showHomeView, showFavoritesView } from './exercises.js';

const STORAGE_KEY = 'page';

let activePage = 'home';

function renderActiveNav(page) {
  qsa('.header__nav-link').forEach(link => {
    link.classList.toggle('header__nav-link--active', link.getAttribute('data-page') === page);
  });

  qsa('.mobile-menu__nav-link').forEach(link => {
    link.classList.toggle('mobile-menu__nav-link--active', link.getAttribute('data-page') === page);
  });
}

function openMobileMenu() {
  const menu = qs('.mobile-menu');
  if (!menu) {
    return;
  }
  menu.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  const menu = qs('.mobile-menu');
  if (!menu) {
    return;
  }
  menu.classList.remove('is-open');
  document.body.style.overflow = '';
}

function setActivePage(page) {
  if (activePage === page) {
    return;
  }
  activePage = page;

  renderActiveNav(activePage);

  if (activePage === 'home') {
    showHomeView();
  } else {
    showFavoritesView();
  }

  writeJson(STORAGE_KEY, activePage);
}

export function getActivePage() {
  return activePage;
}

export function initHeader() {
  const saved = readJson(STORAGE_KEY, null);
  if (saved === 'home' || saved === 'favorites') {
    activePage = saved;
  }

  renderActiveNav(activePage);
  if (activePage === 'home') {
    showHomeView();
  } else {
    showFavoritesView();
  }

  delegate(document, 'click', '.header__nav-link', (e, link) => {
    e.preventDefault();
    const page = link.getAttribute('data-page');
    if (page === 'home' || page === 'favorites') {
      setActivePage(page);
    }
  });

  on(qs('.header__burger'), 'click', openMobileMenu);
  on(qs('.mobile-menu__close'), 'click', closeMobileMenu);

  delegate(document, 'click', '.mobile-menu__nav-link', (e, link) => {
    e.preventDefault();
    const page = link.getAttribute('data-page');
    if (page === 'home' || page === 'favorites') {
      setActivePage(page);
      closeMobileMenu();
    }
  });

  const menu = qs('.mobile-menu');
  on(menu, 'click', e => {
    if (e.target === menu) {
      closeMobileMenu();
    }
  });
}
