// Tiny fetch wrapper. No axios — `fetch` covers everything we need.

const BASE_URL = '/api';

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  // Clear any structural prefix double loops automatically
  let cleanPath = path.startsWith('/api') ? path.substring(4) : path;
  cleanPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  
  const fullUrl = `${BASE_URL}${cleanPath}`;

  const res = await fetch(fullUrl, { // 👈 FIX: Direct requests to your Go Backend
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const error = new Error((data && data.error) || `HTTP ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  get:    (path)       => request(path),
  post:   (path, body) => request(path, { method: 'POST',  body }),
  patch:  (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path)       => request(path, { method: 'DELETE' }), // Added missing explicit DELETE method
};
