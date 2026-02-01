export const qs = (selector, root = document) => root.querySelector(selector);

export const qsa = (selector, root = document) =>
  Array.from(root.querySelectorAll(selector));

export const byId = id => document.getElementById(id);

export const on = (target, type, handler, options) => {
  if (!target) return;
  target.addEventListener(type, handler, options);
};

export const delegate = (target, type, selector, handler) => {
  if (!target) return;
  target.addEventListener(type, e => {
    const matched = e.target instanceof Element ? e.target.closest(selector) : null;
    if (matched && target.contains(matched)) handler(e, matched);
  });
};

export const setText = (el, text) => {
  if (el) el.textContent = text;
};

export const setAttr = (el, name, value) => {
  if (el) el.setAttribute(name, String(value));
};
