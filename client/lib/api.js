async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Confira se o sistema está iniciado.');
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.erro || 'Não foi possível concluir a operação.');
    error.status = response.status;
    if (response.status === 401 && !path.startsWith('/api/auth/')) {
      window.dispatchEvent(new CustomEvent('auth-expired', { detail: error.message }));
    }
    throw error;
  }
  return payload;
}

const jsonBody = (data) => JSON.stringify(data);

export const api = {
  authStatus: () => request('/api/auth/status'),
  login: (data) => request('/api/auth/login', { method: 'POST', body: jsonBody(data) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  listProducts: () => request('/api/products'),
  createProduct: (data) => request('/api/products', { method: 'POST', body: jsonBody(data) }),
  updateProduct: (id, data) => request(`/api/products/${id}`, { method: 'PUT', body: jsonBody(data) }),
  listMovements: () => request('/api/movements'),
  createMovement: (data) => request('/api/movements', { method: 'POST', body: jsonBody(data) }),
};
