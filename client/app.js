import { categoryOptions, movements, products, replaceMovements, replaceProducts, viewLabels } from './data/state.js';
import { escapeHtml, movementRows, productById, productRows, renderLucideIcons } from './lib/ui.js';
import { api } from './lib/api.js';
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
let isLoading = true;
let loadError = '';
let movementReceipt = null;

const screenRenderers = {
  dashboard: () => renderDashboard({ products, movements, categoryOptions }),
  products: () => renderProducts({ products, categoryOptions }),
  entry: () => renderMovement('entry', products, movementReceipt),
  exit: () => renderMovement('exit', products, movementReceipt),
  reports: () => renderReports({ products, movements }),
};
const initialView = window.location.hash.slice(1);
if (screenRenderers[initialView]) currentView = initialView;

function render() {
  const label = viewLabels[currentView];
  updateDataStatus();
  document.getElementById('navProductCount').textContent = products.length;
  document.querySelectorAll('.nav-item').forEach((item) => {
    const active = item.dataset.view === currentView;
    item.classList.toggle('is-active', active);
    if (active) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
  });
  document.title = `${label} | Essencial By Dani`;

  if (isLoading) {
    pageContent.innerHTML = '<section class="panel system-message" role="status"><p>Carregando os dados do estoque…</p></section>';
    return;
  }
  if (loadError) {
    pageContent.innerHTML = `<section class="panel system-message" role="alert"><h1>Não foi possível carregar o estoque</h1><p>${escapeHtml(loadError)}</p><button class="button button-primary" type="button" data-retry-load>Tentar novamente</button></section>`;
    return;
  }

  pageContent.innerHTML = screenRenderers[currentView]();

  if (currentView === 'products') bindProductFilters();
  if ((currentView === 'entry' || currentView === 'exit') && document.getElementById('movementForm')) bindMovementForm();
  if (currentView === 'reports') bindReportFilters();
  renderLucideIcons(pageContent);
}

function updateDataStatus() {
  const status = document.getElementById('dataStatus');
  const label = status.querySelector('span');
  status.classList.toggle('is-connected', !isLoading && !loadError);
  status.classList.toggle('is-error', Boolean(loadError));
  label.textContent = isLoading ? 'Conectando ao banco' : loadError ? 'Banco indisponível' : 'Dados salvos no SQLite';
}

async function loadData() {
  isLoading = true;
  loadError = '';
  render();
  try {
    const [loadedProducts, loadedMovements] = await Promise.all([api.listProducts(), api.listMovements()]);
    replaceProducts(loadedProducts);
    replaceMovements(loadedMovements);
  } catch (error) {
    loadError = error.message;
  } finally {
    isLoading = false;
    render();
  }
}

function upsertProduct(product) {
  const index = products.findIndex((item) => item.id === product.id);
  if (index === -1) products.push(product);
  else products.splice(index, 1, product);
  products.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

function upsertMovement(movement) {
  const index = movements.findIndex((item) => item.id === movement.id);
  if (index === -1) movements.unshift(movement);
  else movements.splice(index, 1, movement);
  movements.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function setView(view, options = {}) {
  if (!screenRenderers[view]) return;
  if (currentView !== view) movementReceipt = null;
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
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const product = productById(products, select.value);
    const rawQuantity = document.getElementById('movementQuantity').value.trim();
    const note = document.getElementById('movementNote').value.trim();
    if (!product) return showToast('Selecione um produto cadastrado.', true);
    if (!/^\d+$/.test(rawQuantity) || !Number.isSafeInteger(Number(rawQuantity)) || Number(rawQuantity) <= 0) return showToast('Informe uma quantidade inteira válida maior que zero.', true);
    const quantity = Number(rawQuantity);
    const type = form.dataset.movementType;
    if (type === 'Saída' && quantity > product.quantity) return showToast(`Saldo insuficiente. Há ${product.quantity} unidade(s) disponível(is).`, true);
    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;
    try {
      const saved = await api.createMovement({
        productId: product.id,
        type: type === 'Entrada' ? 'entrada' : 'saida',
        quantity,
        note,
      });
      upsertProduct(saved.product);
      upsertMovement(saved.movement);
      movementReceipt = currentView === (type === 'Entrada' ? 'entry' : 'exit') ? {
        type,
        productName: saved.product.name,
        quantity: saved.movement.quantity,
        balance: saved.product.quantity,
      } : null;
      render();
    } catch (error) {
      showToast(error.message, true);
    } finally {
      if (submitButton.isConnected) submitButton.disabled = false;
    }
  });
  updateMovementQuantityLimit();
}

function bindReportFilters() {
  const search = document.getElementById('reportSearch');
  const type = document.getElementById('typeFilter');
  const productFilter = document.getElementById('productFilter');
  const dateFrom = document.getElementById('dateFromFilter');
  const dateTo = document.getElementById('dateToFilter');
  const rows = document.getElementById('reportRows');
  const count = document.getElementById('reportResultCount');
  const update = () => {
    const term = search.value.trim().toLocaleLowerCase('pt-BR');
    const selectedType = type.value;
    const selectedProduct = productFilter.value;
    const from = dateFrom.value;
    const to = dateTo.value;
    if (from && to && from > to) {
      rows.innerHTML = movementRows([], products, 'A data inicial deve ser anterior ou igual à data final.');
      count.textContent = 'Período inválido';
      renderLucideIcons(rows);
      return;
    }
    const filtered = [...movements].sort((a, b) => new Date(b.date) - new Date(a.date)).filter((movement) => {
      const product = productById(products, movement.productId);
      const matchesText = `${product?.name || ''} ${movement.note || ''}`.toLocaleLowerCase('pt-BR').includes(term);
      const movementDate = localDateKey(movement.date);
      return matchesText
        && (!selectedType || movement.type === selectedType)
        && (!selectedProduct || movement.productId === Number(selectedProduct))
        && (!from || movementDate >= from)
        && (!to || movementDate <= to);
    });
    rows.innerHTML = movementRows(filtered, products, 'Nenhuma movimentação corresponde aos filtros.');
    renderLucideIcons(rows);
    count.textContent = `${filtered.length} ${filtered.length === 1 ? 'registro' : 'registros'}`;
  };
  search.addEventListener('input', update);
  type.addEventListener('change', update);
  productFilter.addEventListener('change', update);
  dateFrom.addEventListener('change', update);
  dateTo.addEventListener('change', update);
  update();
}

function localDateKey(value) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function openProductModal(productId = null) {
  const product = productId ? productById(products, productId) : null;
  const editing = Boolean(product);
  modalRoot.innerHTML = renderProductModal(product, categoryOptions);
  renderLucideIcons(modalRoot);
  document.getElementById('productName').focus();
  document.getElementById('productForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') || '').trim();
    const price = Number(String(formData.get('price') || '0').replace(',', '.'));
    const quantity = Number(formData.get('quantity') || (editing ? product.quantity : '0'));
    const minimum = Number(formData.get('minimum') || '0');
    if (!name) return showToast('Informe o nome do produto.', true);
    if (!Number.isFinite(price) || price < 0) return showToast('Informe um preço válido.', true);
    if (!Number.isSafeInteger(quantity) || quantity < 0 || !Number.isSafeInteger(minimum) || minimum < 0) return showToast('Saldo e estoque mínimo devem ser números inteiros válidos e não negativos.', true);
    const data = {
      name,
      category: String(formData.get('category') || ''),
      supplier: String(formData.get('supplier') || '').trim(),
      price,
      minimum,
    };
    const submitButton = event.currentTarget.querySelector('[type="submit"]');
    submitButton.disabled = true;
    try {
      if (editing) {
        upsertProduct(await api.updateProduct(product.id, data));
      } else {
        const created = await api.createProduct({ ...data, quantity });
        upsertProduct(created.product);
        if (created.initialMovement) upsertMovement(created.initialMovement);
      }
      modalRoot.innerHTML = '';
      render();
      showToast(editing ? 'Produto atualizado no banco de dados.' : 'Produto cadastrado no banco de dados.');
    } catch (error) {
      showToast(error.message, true);
    } finally {
      if (submitButton.isConnected) submitButton.disabled = false;
    }
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
  if (target.closest('[data-next-movement]')) {
    movementReceipt = null;
    render();
  }
  if (target.closest('[data-retry-load]')) loadData();
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
loadData();
