const lucideIcons = Object.freeze({
  grid: 'layout-dashboard', box: 'package', down: 'arrow-down-to-line', up: 'arrow-up-from-line',
  chart: 'chart-no-axes-combined', search: 'search', plus: 'plus', edit: 'pencil', close: 'x',
  alert: 'triangle-alert', check: 'circle-check', error: 'circle-alert',
});

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dateTime = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export const icon = (name) => `<i class="icon" data-lucide="${lucideIcons[name] || 'circle-help'}" aria-hidden="true"></i>`;
export const renderLucideIcons = (root = document) => window.lucide?.createIcons({ root });
export const formatMoney = (value) => money.format(value);
export const formatDateTime = (value) => dateTime.format(new Date(value));
export const productById = (products, id) => products.find((product) => product.id === Number(id));

export function stockState(product) {
  if (product.quantity === 0) return { label: 'Sem estoque', className: 'status-out' };
  if (product.quantity <= product.minimum) return { label: 'Estoque baixo', className: 'status-low' };
  return { label: 'Disponível', className: 'status-ok' };
}

export function heading(eyebrow, title, copy, actions = '') {
  return `<div class="page-heading"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="heading-copy">${copy}</p></div>${actions ? `<div class="heading-actions">${actions}</div>` : ''}</div>`;
}

export function metricCard(label, value, foot, iconName, color = '') {
  return `<article class="metric-card"><div class="metric-top"><span class="metric-label">${label}</span><span class="metric-icon ${color}">${icon(iconName)}</span></div><div class="metric-value">${value}</div><div class="metric-foot">${foot}</div></article>`;
}

export function movementType(type) {
  const entry = type === 'Entrada';
  return `<span class="type-pill ${entry ? 'entry' : 'exit'}"><span>${icon(entry ? 'down' : 'up')}</span>${entry ? 'Entrada' : 'Saída'}</span>`;
}

export function movementRows(list, products, emptyText = 'Nenhuma movimentação encontrada.') {
  if (!list.length) return `<tr><td colspan="6"><div class="empty-state">${emptyText}</div></td></tr>`;
  return list.map((movement) => {
    const product = productById(products, movement.productId);
    return `<tr>
      <td class="main-cell">#${movement.id}</td>
      <td class="main-cell">${escapeHtml(product?.name || 'Produto não encontrado')}</td>
      <td>${movementType(movement.type)}</td>
      <td class="main-cell">${movement.type === 'Entrada' ? '+' : '−'}${movement.quantity} un.</td>
      <td>${escapeHtml(movement.note || '—')}</td>
      <td class="movement-date">${formatDateTime(movement.date)}</td>
    </tr>`;
  }).join('');
}

export function productRows(list, emptyText = 'Nenhum produto corresponde a esta busca.') {
  if (!list.length) return `<tr><td colspan="7"><div class="empty-state">${emptyText}</div></td></tr>`;
  return list.map((product) => {
    const state = stockState(product);
    return `<tr>
      <td><div class="table-product"><b>${escapeHtml(product.name)}</b></div></td>
      <td>${escapeHtml(product.category)}</td>
      <td>${escapeHtml(product.supplier || '—')}</td>
      <td class="main-cell">${formatMoney(product.price)}</td>
      <td class="main-cell">${product.quantity} <span class="minimum-stock">/ mín. ${product.minimum}</span></td>
      <td><span class="status ${state.className}">${state.label}</span></td>
      <td><button class="table-action" type="button" data-edit-product="${product.id}" aria-label="Editar ${escapeHtml(product.name)}">${icon('edit')}</button></td>
    </tr>`;
  }).join('');
}
