const BASE = '/api';
const TOKEN_KEY = 'medvault_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(BASE + path, { ...options, headers });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : await res.text();

  if (res.status === 401) {
    setToken(null);
    // Notifica a la app para redirigir al login
    window.dispatchEvent(new CustomEvent('medvault:unauthorized'));
  }

  if (!res.ok) {
    const msg = (body && body.detail) || res.statusText || 'Error de red';
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return body;
}

export const api = {
  // Auth
  login: (cedula, password) =>
    request('/login', { method: 'POST', body: JSON.stringify({ cedula, password }) }),
  logout: () => request('/logout', { method: 'POST' }),
  me: () => request('/me'),

  // Usuarios (admin)
  listUsuarios: () => request('/usuarios'),
  createUsuario: (payload) =>
    request('/usuarios', { method: 'POST', body: JSON.stringify(payload) }),
  updateUsuario: (id, payload) =>
    request(`/usuarios/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),

  // Pacientes
  listPacientes: () => request('/pacientes'),
  createPaciente: (payload) =>
    request('/pacientes', { method: 'POST', body: JSON.stringify(payload) })
};
