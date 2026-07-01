const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const msg = (body && body.detail) || res.statusText || 'Error de red';
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return body;
}

export const api = {
  listPacientes: () => request('/pacientes'),
  createPaciente: (payload) =>
    request('/pacientes', { method: 'POST', body: JSON.stringify(payload) })
};
