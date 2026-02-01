import { readJson, writeJson } from './core/storage.js';

const STORAGE_KEY = 'favorites';

export function getFavorites() {
  return readJson(STORAGE_KEY, []);
}

function addToFavorites(exerciseId) {
  try {
    const favorites = getFavorites();
    if (!favorites.includes(exerciseId)) {
      favorites.push(exerciseId);
      writeJson(STORAGE_KEY, favorites);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

export function removeFromFavorites(exerciseId) {
  try {
    const favorites = getFavorites();
    const filteredFavorites = favorites.filter(id => id !== exerciseId);
    writeJson(STORAGE_KEY, filteredFavorites);
    return true;
  } catch (error) {
    return false;
  }
}

export function isFavorite(exerciseId) {
  const favorites = getFavorites();
  return favorites.includes(exerciseId);
}

export function toggleFavorite(exerciseId) {
  if (isFavorite(exerciseId)) {
    removeFromFavorites(exerciseId);
    return false; 
  } else {
    addToFavorites(exerciseId);
    return true; 
  }
}
