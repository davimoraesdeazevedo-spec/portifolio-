// Thin fetch helpers for the app's own JSON API.

async function parse(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Erro ${response.status}`);
  return body;
}

export async function apiGet(path) {
  return parse(await fetch(path, { cache: 'no-store' }));
}

export async function apiPost(path, payload) {
  return parse(
    await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  );
}

export async function apiPatch(path, payload) {
  return parse(
    await fetch(path, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  );
}

export async function apiDelete(path) {
  return parse(await fetch(path, { method: 'DELETE' }));
}

export async function uploadFile(file) {
  const form = new FormData();
  form.append('file', file);
  const response = await fetch('/api/uploads', { method: 'POST', body: form });
  return parse(response);
}

/** Builds "?a=1&b=2" from a plain object, skipping empty values. */
export function buildQuery(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}
