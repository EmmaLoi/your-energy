const API_BASE_URL = 'https://your-energy.b.goit.study/api';
const FILTERS_URL = `${API_BASE_URL}/filters`;
const FILTERS_ENDPOINT = `${API_BASE_URL}/filters`;

export async function fetchJson(path, options) {
  const normalizedPath = (typeof path === 'string' && path.startsWith('/api/')) ? path.slice(4) : path;
  const url = normalizedPath.startsWith('http') ? normalizedPath : `${API_BASE_URL}${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`;
  const response = await fetch(url, options);

  if (response.status === 204) {
    return null;
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error || response.statusText || 'Request failed';
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export { FILTERS_ENDPOINT, FILTERS_URL};
