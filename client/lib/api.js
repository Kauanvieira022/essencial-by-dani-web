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
  if (!response.ok) throw new Error(payload.erro || 'Não foi possível concluir a operação.');
  return payload;
}

const jsonBody = (data) => JSON.stringify(data);

export const api = {
  listProducts: () => request('/api/products'),
  createProduct: (data) => request('/api/products', { method: 'POST', body: jsonBody(data) }),
  updateProduct: (id, data) => request(`/api/products/${id}`, { method: 'PUT', body: jsonBody(data) }),
  listMovements: () => request('/api/movements'),
  createMovement: (data) => request('/api/movements', { method: 'POST', body: jsonBody(data) }),
};
