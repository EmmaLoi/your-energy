import { byId, setText } from './core/dom.js';
import { fetchJson } from './core/api.js';
import { readJson, writeJson } from './core/storage.js';

const STORAGE_KEY = 'quote_cache_v1';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function getQuoteOfTheDay() {
  const cached = readJson(STORAGE_KEY, null);
  const today = todayKey();

  if (cached && cached.date === today && cached.quote && cached.author) {
    return cached;
  }

  try {
    const data = await fetchJson('/quote');
    const next = { date: today, quote: data.quote, author: data.author };
    writeJson(STORAGE_KEY, next);
    return next;
  } catch {
    
    return cached && cached.quote && cached.author ? cached : null;
  }
}

export async function displayQuote() {
  const data = await getQuoteOfTheDay();
  if (!data) return;
  setText(byId('js-quote-text'), data.quote);
  setText(byId('js-quote-author'), data.author);
}
