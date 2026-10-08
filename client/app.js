import { categoryOptions, movements, products, viewLabels } from './data/demo-data.js';
import { movementRows, productById, productRows, renderLucideIcons } from './lib/ui.js';
import { renderProductModal } from './components/product-modal.js';
import { showToast } from './components/toast.js';
import { renderDashboard } from './screens/dashboard.js';
import { renderProducts } from './screens/products.js';
import { renderMovement } from './screens/movement.js';
import { renderReports } from './screens/reports.js';

const pageContent = document.getElementById('pageContent');
const modalRoot = document.getElementById('modalRoot');
const sidebar = document.getElementById('sidebar');
let currentView = 'dashboard';
let onlyLowStock = false;

const screenRenderers = {
  dashboard: () => renderDashboard({ products, movements, categoryOptions }),
  products: () => renderProducts({ products, categoryOptions }),
  entry: () => renderMovement('entry', products),
  exit: () => renderMovement('exit', products),
  reports: () => renderReports({ products, movements }),
};
const initialView = window.location.hash.slice(1);
if (screenRenderers[initialView]) currentView = initialView;

function render() {
  const label = viewLabels[currentView];
  pageContent.innerHTML = screenRenderers[currentView]();
  document.getElementById('navProductCount').textContent = products.length;
  document.querySelectorAll('.nav-item').forEach((item) => {
    const active = item.dataset.view === currentView;
    item.classList.toggle('is-active', active);
    if (active) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
  });
  document.title = `${label} | Essencial By Dani`;

  if (currentView === 'products') bindProductFilters();
  if (currentView === 'entry' || currentView === 'exit') bindMovementForm();
  if (currentView === 'reports') bindReportFilters();
  renderLucideIcons(pageContent);
}

function setView(view, options = {}) {
  if (!screenRenderers[view]) return;
  currentView = view;
  if (view === 'products') onlyLowStock = Boolean(options.lowStock);
  if (!options.fromHistory && window.location.hash !== `#${view}`) window.history.pushState({ view, lowStock: onlyLowStock }, '', `#${view}`);
  sidebar.classList.remove('is-open');
  overlay.classList.remove('is-visible');
  document.getElementById('menuToggle').setAttribute('aria-expanded', 'false');
  render();
  pageContent.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function bindProductFilters() {
  const search = document.getElementById('productSearch');
  const category = document.getElementById('categoryFilter');
  const lowToggle = document.getElementById('lowStockToggle');
  const rows = document.getElementById('productRows');
  const count = document.getElementById('productResultCount');
  const update = () => {
    const term = search.value.trim().toLocaleLowerCase('pt-BR');
    const selectedCategory = category.value;
    const filtered = products.filter((product) => {
      const matchesTerm = [product.name, product.category, product.supplier].some((value) => String(value).toLocaleLowerCase('pt-BR').includes(term));
      return matchesTerm && (!selectedCategory || product.category === selectedCategory) && (!onlyLowStock || product.quantity <= product.minimum);
    });
    rows.innerHTML = productRows(filtered);
    renderLucideIcons(rows);
    count.textContent = `${filtered.length} ${filtered.length === 1 ? 'produto' : 'produtos'}`;
  };
  lowToggle.classList.toggle('is-active', onlyLowStock);
  lowToggle.setAttribute('aria-pressed', String(onlyLowStock));
  search.addEventListener('input', update);
  category.addEventListener('change', update);
  lowToggle.addEventListener('click', () => {
    onlyLowStock = !onlyLowStock;
    lowToggle.classList.toggle('is-active', onlyLowStock);
    lowToggle.setAttribute('aria-pressed', String(onlyLowStock));
    update();
  });
  update();
}

function updateMovementQuantityLimit() {
  const select = document.getElementById('movementProduct');
  const quantityInput = document.getElementById('movementQuantity');
  if (!select || !quantityInput) return;
  const product = productById(products, select.value);
  if (!product) {
    quantityInput.removeAttribute('max');
    quantityInput.placeholder = 'Ex.: 3';
    return;
  }
  const isExit = document.getElementById('movementForm').dataset.movementType === 'Saída';
  quantityInput.max = isExit ? String(product.quantity) : '';
  quantityInput.placeholder = isExit ? `Até ${product.quantity} unidades` : 'Ex.: 3';
}

function bindMovementForm() {
  const form = document.getElementById('movementForm');
  const select = document.getElementById('movementProduct');
  select.addEventListener('change', updateMovementQuantityLimit);
  form.addEventListener('reset', () => setTimeout(updateMovementQuantityLimit, 0));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const product = productById(products, select.value);
    const rawQuantity = document.getElementById('movementQuantity').value.trim();
    const note = document.getElementById('movementNote').value.trim();
    if (!product) return showToast('Selecione um produto cadastrado.', true);
    if (!/^\d+$/.test(rawQuantity) || !Number.isSafeInteger(Number(rawQuantity)) || Number(rawQuantity) <= 0) return showToast('Informe uma quantidade inteira válida maior que zero.', true);
    const quantity = Number(rawQuantity);
    const type = form.dataset.movementType;
    if (type === 'Saída' && quantity > product.quantity) return showToast(`Saldo insuficiente. Há ${product.quantity} unidade(s) disponível(is).`, true);
    product.quantity += type === 'Entrada' ? quantity : -quantity;
    movements.unshift({
      id: Math.max(1000, ...movements.map((item) => item.id)) + 1,
      productId: product.id,
      type,
      quantity,
      note: note || (type === 'Entrada' ? 'Entrada de estoque' : 'Saída de estoque'),
      date: new Date().toISOString(),
    });
    render();
    showToast(`${type} registrada. Os dados demonstrativos não são persistidos.`);
  });
  updateMovementQuantityLimit();
}

function bindReportFilters() {
  const search = document.getElementById('reportSearch');
  const type = document.getElementById('typeFilter');
  const rows = document.getElementById('reportRows');
  const count = document.getElementById('reportResultCount');
  const update = () => {
    const term = search.value.trim().toLocaleLowerCase('pt-BR');
    const selectedType = type.value;
    const filtered = [...movements].sort((a, b) => new Date(b.date) - new Date(a.date)).filter((movement) => {
      const product = productById(products, movement.productId);
      const matchesText = `${product?.name || ''} ${movement.note || ''}`.toLocaleLowerCase('pt-BR').includes(term);
      return matchesText && (!selectedType || movement.type === selectedType);
    });
    rows.innerHTML = movementRows(filtered, products, 'Nenhuma movimentação corresponde aos filtros.');
    renderLucideIcons(rows);
    count.textContent = `${filtered.length} ${filtered.length === 1 ? 'registro' : 'registros'}`;
  };
  search.addEventListener('input', update);
  type.addEventListener('change', update);
  update();
}

function openProductModal(productId = null) {
  const product = productId ? productById(products, productId) : null;
  const editing = Boolean(product);
  modalRoot.innerHTML = renderProductModal(product, categoryOptions);
  renderLucideIcons(modalRoot);
  document.getElementById('productName').focus();
  document.getElementById('productForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') || '').trim();
    const price = Number(String(formData.get('price') || '0').replace(',', '.'));
    const quantity = Number(formData.get('quantity') || (editing ? product.quantity : '0'));
    const minimum = Number(formData.get('minimum') || '0');
    if (!name) return showToast('Informe o nome do produto.', true);
    if (!Number.isFinite(price) || price < 0) return showToast('Informe um preço válido.', true);
    if (!Number.isSafeInteger(quantity) || quantity < 0 || !Number.isSafeInteger(minimum) || minimum < 0) return showToast('Saldo e estoque mínimo devem ser números inteiros válidos e não negativos.', true);
    const data = { name, category: String(formData.get('category') || ''), supplier: String(formData.get('supplier') || '').trim(), price, minimum };
    if (editing) Object.assign(product, data);
    else products.push({ id: Math.max(0, ...products.map((item) => item.id)) + 1, ...data, quantity });
    modalRoot.innerHTML = '';
    render();
    showToast(editing ? 'Produto atualizado no protótipo.' : 'Produto adicionado ao protótipo.');
  });
}

const overlay = document.createElement('button');
overlay.className = 'mobile-overlay';
overlay.type = 'button';
overlay.setAttribute('aria-label', 'Fechar menu');
overlay.addEventListener('click', closeMobileMenu);
document.body.append(overlay);

function closeMobileMenu() {
  sidebar.classList.remove('is-open');
  overlay.classList.remove('is-visible');
  document.getElementById('menuToggle').setAttribute('aria-expanded', 'false');
}

document.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;
  const viewButton = target.closest('[data-view]');
  if (viewButton) {
    event.preventDefault();
    setView(viewButton.dataset.view, { lowStock: Boolean(viewButton.dataset.lowStockLink) });
  }
  const editButton = target.closest('[data-edit-product]');
  if (editButton) openProductModal(editButton.dataset.editProduct);
  if (target.closest('[data-new-product]')) openProductModal();
  if (target.closest('[data-close-modal]') || target === modalRoot) modalRoot.innerHTML = '';
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    modalRoot.innerHTML = '';
    closeMobileMenu();
  }
});

document.getElementById('menuToggle').addEventListener('click', (event) => {
  const isOpen = sidebar.classList.toggle('is-open');
  overlay.classList.toggle('is-visible', isOpen);
  event.currentTarget.setAttribute('aria-expanded', String(isOpen));
});

window.addEventListener('popstate', (event) => {
  const view = screenRenderers[window.location.hash.slice(1)] ? window.location.hash.slice(1) : 'dashboard';
  setView(view, { fromHistory: true, lowStock: Boolean(event.state?.lowStock) });
});

render();
renderLucideIcons(document);
