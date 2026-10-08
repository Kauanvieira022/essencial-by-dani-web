const products = [
  { id: 1, name: 'Aura Floral Intense 100ml', category: 'Perfumes', supplier: 'Distribuidora Bela', price: 189.9, quantity: 6, minimum: 5 },
  { id: 2, name: 'Body Splash Chá Branco', category: 'Perfumes', supplier: 'Essenza Atacado', price: 69.9, quantity: 2, minimum: 4 },
  { id: 3, name: 'Batom Matte Rosa Antigo', category: 'Maquiagem', supplier: 'Make Center', price: 39.9, quantity: 12, minimum: 5 },
  { id: 4, name: 'Sérum Facial Vitamina C', category: 'Cuidados pessoais', supplier: 'Derma Mais', price: 84.9, quantity: 3, minimum: 4 },
  { id: 5, name: 'Máscara de Cílios Volume', category: 'Maquiagem', supplier: 'Make Center', price: 54.9, quantity: 8, minimum: 5 },
  { id: 6, name: 'Hidratante Corporal 400ml', category: 'Cuidados pessoais', supplier: 'Essenza Atacado', price: 49.9, quantity: 0, minimum: 3 },
  { id: 7, name: 'Essência Amadeirada 50ml', category: 'Perfumes', supplier: 'Distribuidora Bela', price: 129.9, quantity: 9, minimum: 4 },
  { id: 8, name: 'Paleta Nude Essencial', category: 'Maquiagem', supplier: 'Make Center', price: 99.9, quantity: 5, minimum: 5 },
];

const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
const movements = [
  { id: 1004, productId: 3, type: 'Saída', quantity: 1, note: 'Venda no atendimento', date: hoursAgo(1) },
  { id: 1003, productId: 2, type: 'Entrada', quantity: 5, note: 'Reposição do fornecedor', date: hoursAgo(3) },
  { id: 1002, productId: 5, type: 'Saída', quantity: 2, note: 'Venda pelo canal digital', date: hoursAgo(20) },
  { id: 1001, productId: 7, type: 'Entrada', quantity: 4, note: 'Compra semanal', date: hoursAgo(31) },
  { id: 1000, productId: 1, type: 'Saída', quantity: 1, note: 'Venda no atendimento', date: hoursAgo(54) },
];

const categoryOptions = ['Perfumes', 'Maquiagem', 'Cuidados pessoais'];
const viewLabels = { dashboard: 'Visão geral', products: 'Produtos', entry: 'Entrada de estoque', exit: 'Saída de estoque', reports: 'Movimentações' };
const pageContent = document.getElementById('pageContent');
const modalRoot = document.getElementById('modalRoot');
let currentView = 'dashboard';
let onlyLowStock = false;
let toastTimer;

const lucideIcons = Object.freeze({
  leaf: 'leaf', grid: 'layout-dashboard', box: 'package', down: 'arrow-down-to-line',
  up: 'arrow-up-from-line', chart: 'chart-no-axes-combined', search: 'search', plus: 'plus',
  bell: 'bell', edit: 'pencil', chevron: 'chevron-right', menu: 'menu', close: 'x',
  clock: 'clock-3', alert: 'triangle-alert', more: 'ellipsis', check: 'circle-check', error: 'circle-alert',
});

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dateTime = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const shortDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const icon = (name) => `<i class="icon" data-lucide="${lucideIcons[name] || 'circle-help'}" aria-hidden="true"></i>`;

function renderLucideIcons(root = document) {
  window.lucide?.createIcons({ root });
}

function stockState(product) {
  if (product.quantity === 0) return { label: 'Sem estoque', className: 'status-out' };
  if (product.quantity <= product.minimum) return { label: 'Estoque baixo', className: 'status-low' };
  return { label: 'Disponível', className: 'status-ok' };
}

function productById(id) {
  return products.find((product) => product.id === Number(id));
}

function productThumb(product, extraClass = '') {
  const initials = product.name.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
  const tint = product.category === 'Maquiagem' ? 'rose' : product.category === 'Cuidados pessoais' ? 'green' : '';
  return `<span class="product-thumb ${tint} ${extraClass}" aria-hidden="true">${escapeHtml(initials)}</span>`;
}

function heading(eyebrow, title, copy, actions = '') {
  return `<div class="page-heading"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="heading-copy">${copy}</p></div>${actions ? `<div class="heading-actions">${actions}</div>` : ''}</div>`;
}

function metricCard(label, value, foot, iconName, color = '') {
  return `<article class="metric-card"><div class="metric-top"><span class="metric-label">${label}</span><span class="metric-icon ${color}">${icon(iconName)}</span></div><div class="metric-value">${value}</div><div class="metric-foot">${foot}</div></article>`;
}

function movementType(type) {
  const entry = type === 'Entrada';
  return `<span class="type-pill ${entry ? 'entry' : 'exit'}"><span>${icon(entry ? 'down' : 'up')}</span>${entry ? 'Entrada' : 'Saída'}</span>`;
}

function movementRows(list, emptyText = 'Nenhuma movimentação encontrada.') {
  if (!list.length) return `<tr><td colspan="6"><div class="empty-state">${emptyText}</div></td></tr>`;
  return list.map((movement) => {
    const product = productById(movement.productId);
    return `<tr>
      <td class="main-cell">#${movement.id}</td>
      <td class="main-cell">${escapeHtml(product?.name || 'Produto não encontrado')}</td>
      <td>${movementType(movement.type)}</td>
      <td class="main-cell">${movement.type === 'Entrada' ? '+' : '−'}${movement.quantity} un.</td>
      <td>${escapeHtml(movement.note || '—')}</td>
      <td class="movement-date">${dateTime.format(new Date(movement.date))}</td>
    </tr>`;
  }).join('');
}

function productRows(list) {
  if (!list.length) return '<tr><td colspan="7"><div class="empty-state">Nenhum produto corresponde a esta busca.</div></td></tr>';
  return list.map((product) => {
    const state = stockState(product);
    return `<tr>
      <td><div class="table-product">${productThumb(product)}<span><b>${escapeHtml(product.name)}</b><small>SKU ${String(product.id).padStart(4, '0')}</small></span></div></td>
      <td>${escapeHtml(product.category)}</td>
      <td>${escapeHtml(product.supplier || '—')}</td>
      <td class="main-cell">${money.format(product.price)}</td>
      <td class="main-cell">${product.quantity} <span style="font-weight:400;color:var(--muted)">/ mín. ${product.minimum}</span></td>
      <td><span class="status ${state.className}">${state.label}</span></td>
      <td><button class="table-action" type="button" data-edit-product="${product.id}" aria-label="Editar ${escapeHtml(product.name)}">${icon('edit')}</button></td>
    </tr>`;
  }).join('');
}

function renderDashboard() {
  const lowProducts = products.filter((product) => product.quantity <= product.minimum).sort((a, b) => a.quantity - b.quantity);
  const totalUnits = products.reduce((sum, product) => sum + product.quantity, 0);
  const entryUnits = movements.filter((item) => item.type === 'Entrada').reduce((sum, item) => sum + item.quantity, 0);
  const exitUnits = movements.filter((item) => item.type === 'Saída').reduce((sum, item) => sum + item.quantity, 0);
  const categoryTotals = categoryOptions.map((category) => ({ category, quantity: products.filter((product) => product.category === category).reduce((sum, product) => sum + product.quantity, 0) }));
  const maxCategory = Math.max(1, ...categoryTotals.map((item) => item.quantity));
  const latest = [...movements].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);
  const welcomeDate = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  return `<section class="welcome-banner"><div class="welcome-content"><p class="eyebrow">${escapeHtml(welcomeDate)}</p><h1>Seu estoque, em harmonia.</h1><p>Acompanhe seus produtos e mantenha cada movimentação em dia.</p></div><div class="welcome-actions"><button class="button button-primary" data-view="entry" type="button">${icon('down')} Registrar entrada</button><button class="button" data-view="exit" type="button">${icon('up')} Registrar saída</button></div></section>
    <section class="metric-grid" aria-label="Resumo do estoque">
      ${metricCard('Produtos cadastrados', products.length, '<span>itens no catálogo</span>', 'box')}
      ${metricCard('Unidades em estoque', totalUnits, '<span class="accent">saldo atualizado</span>', 'grid', 'green')}
      ${metricCard('Atenção para reposição', lowProducts.length, '<span class="warn">no limite ou abaixo do mínimo</span>', 'alert', 'amber')}
      ${metricCard('Movimentos registrados', movements.length, `<span>+${entryUnits} entradas · −${exitUnits} saídas</span>`, 'chart', 'rose')}
    </section>
    <section class="dashboard-grid">
      <article class="panel"><div class="panel-heading"><div><h2>Unidades por categoria</h2><p>Distribuição do saldo atual</p></div><button class="text-link" type="button" data-view="products">Ver produtos →</button></div>
        <div class="category-list">${categoryTotals.map((item) => `<div class="category-row"><span class="category-name">${escapeHtml(item.category)}</span><span class="progress-track"><span class="progress-bar" style="width:${Math.max(2, item.quantity / maxCategory * 100)}%"></span></span><span class="category-quantity">${item.quantity}<small>unidades</small></span></div>`).join('')}</div>
      </article>
      <article class="panel"><div class="panel-heading"><div><h2>Precisa de atenção</h2><p>Produtos no mínimo ou abaixo dele</p></div><button class="text-link" type="button" data-view="products">Ver lista →</button></div>
        <div class="low-stock-list">${lowProducts.length ? lowProducts.slice(0, 4).map((product) => `<div class="low-stock-item">${productThumb(product)}<span class="low-stock-copy"><b>${escapeHtml(product.name)}</b><small>${escapeHtml(product.category)}</small></span><span class="stock-amount">${product.quantity} un.<small>mín. ${product.minimum}</small></span></div>`).join('') : '<div class="empty-state">Tudo em dia por aqui.</div>'}</div>
      </article>
    </section>
    <section class="panel movement-panel"><div class="panel-heading"><div><h2>Movimentações recentes</h2><p>Últimos registros de entrada e saída</p></div><button class="text-link" type="button" data-view="reports">Ver histórico →</button></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Código</th><th>Produto</th><th>Movimento</th><th>Quantidade</th><th>Observação</th><th>Data e hora</th></tr></thead><tbody>${movementRows(latest)}</tbody></table></div>
    </section>`;
}

function renderProducts() {
  return `${heading('Catálogo', 'Produtos', 'Consulte os itens cadastrados, acompanhe o saldo e identifique o que precisa de reposição.', `<button class="button button-primary" type="button" data-new-product>${icon('plus')} Novo produto</button>`)}
    <section class="metric-grid product-metrics">${metricCard('Itens no catálogo', products.length, '<span>produtos cadastrados</span>', 'box')}${metricCard('Unidades disponíveis', products.reduce((sum, p) => sum + p.quantity, 0), '<span>saldo total atual</span>', 'grid', 'green')}${metricCard('Estoque baixo', products.filter((p) => p.quantity > 0 && p.quantity <= p.minimum).length, '<span class="warn">requer atenção</span>', 'alert', 'amber')}${metricCard('Sem estoque', products.filter((p) => p.quantity === 0).length, '<span class="warn">indisponível para saída</span>', 'box', 'rose')}</section>
    <section class="panel"><div class="panel-heading"><div><h2>Todos os produtos</h2><p>Pesquise por nome, categoria ou fornecedor</p></div></div>
      <div class="filter-bar"><label class="search-field">${icon('search')}<input id="productSearch" type="search" placeholder="Buscar produto..." autocomplete="off" /></label><select class="filter-select" id="categoryFilter" aria-label="Filtrar por categoria"><option value="">Todas as categorias</option>${categoryOptions.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('')}</select><button class="filter-toggle" id="lowStockToggle" type="button" aria-pressed="false">${icon('alert')} Estoque baixo</button><span class="result-count" id="productResultCount"></span></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Produto</th><th>Categoria</th><th>Fornecedor</th><th>Preço</th><th>Saldo</th><th>Status</th><th>Ação</th></tr></thead><tbody id="productRows"></tbody></table></div>
    </section>`;
}

function renderMovement(view) {
  const isEntry = view === 'entry';
  const type = isEntry ? 'Entrada' : 'Saída';
  const title = isEntry ? 'Registrar entrada' : 'Registrar saída';
  const subtitle = isEntry ? 'Atualize o saldo quando novas mercadorias chegarem.' : 'Registre a retirada de produtos e confira o saldo disponível.';
  const options = products.map((product) => `<option value="${product.id}">${escapeHtml(product.name)} — ${product.quantity} un. disponíveis</option>`).join('');
  const recent = [...movements].filter((item) => item.type === type).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
  return `${heading('Movimentação de estoque', title, subtitle)}
    <section class="movement-layout"><article class="panel movement-form-panel"><div class="form-section-heading"><span class="metric-icon ${isEntry ? 'green' : 'rose'}">${icon(isEntry ? 'down' : 'up')}</span><span><h2>Dados da ${isEntry ? 'entrada' : 'saída'}</h2><p>Os campos marcados com * são obrigatórios</p></span></div>
      <form id="movementForm" data-movement-type="${type}"><div class="form-grid">
        <div class="form-field full"><label for="movementProduct">Produto <span class="required">*</span></label><select class="form-control" id="movementProduct" required ${products.length ? '' : 'disabled'}>${products.length ? options : '<option value="">Cadastre um produto primeiro</option>'}</select><p class="form-hint">Selecione o item que deseja movimentar.</p></div>
        <div class="form-field"><label for="movementQuantity">Quantidade <span class="required">*</span></label><input class="form-control" id="movementQuantity" type="number" min="1" step="1" inputmode="numeric" placeholder="Ex.: 3" required /><p class="form-hint">Informe um número inteiro maior que zero.</p></div>
        <div class="form-field"><label>Tipo de registro</label><div class="form-control" style="display:flex;align-items:center;background:#fbfcfc;color:${isEntry ? 'var(--green-600)' : 'var(--rose-700)'};font-weight:700">${icon(isEntry ? 'down' : 'up')} &nbsp; ${type}</div></div>
        <div class="form-field full"><label for="movementNote">Observação <span style="color:var(--muted);font-weight:400">(opcional)</span></label><textarea class="form-control" id="movementNote" placeholder="Ex.: reposição do fornecedor, venda no atendimento..."></textarea><p class="form-hint">Uma observação ajuda a entender o histórico depois.</p></div>
      </div><div class="selected-product-card" id="selectedProductCard"></div><div class="form-actions"><button class="button" type="reset">Limpar campos</button><button class="button button-primary" type="submit">${icon(isEntry ? 'down' : 'up')} Confirmar ${isEntry ? 'entrada' : 'saída'}</button></div></form>
    </article>
    <aside><article class="panel guide-panel"><h2>Como funciona</h2><p>O saldo é atualizado junto com o histórico da movimentação.</p><div class="guide-step"><span class="step-number">1</span><span><b>Escolha o produto</b><small>Confira o nome e o saldo atual antes de registrar.</small></span></div><div class="guide-step"><span class="step-number">2</span><span><b>Informe a quantidade</b><small>Use apenas números inteiros positivos.</small></span></div><div class="guide-step"><span class="step-number">3</span><span><b>Confirme o registro</b><small>O movimento aparecerá no histórico logo após salvar.</small></span></div><div class="guide-tip">${icon('alert')} Na saída, a quantidade não pode ser maior que o saldo disponível.</div></article>
      <article class="panel recent-mini"><div class="panel-heading"><div><h2>Últimas ${isEntry ? 'entradas' : 'saídas'}</h2><p>Registros recentes</p></div><button class="text-link" type="button" data-view="reports">Ver todas →</button></div><div class="low-stock-list">${recent.length ? recent.map((movement) => { const product = productById(movement.productId); return `<div class="low-stock-item">${productThumb(product || { name: 'Produto', category: '' })}<span class="low-stock-copy"><b>${escapeHtml(product?.name || 'Produto não encontrado')}</b><small>${dateTime.format(new Date(movement.date))}</small></span><span class="selected-stock">${movement.quantity} un.<small>${type}</small></span></div>`; }).join('') : '<div class="empty-state">Ainda não há registros.</div>'}</div></article></aside></section>`;
}

function renderReports() {
  const sorted = [...movements].sort((a, b) => new Date(b.date) - new Date(a.date));
  return `${heading('Histórico de estoque', 'Movimentações', 'Consulte o que entrou e saiu do estoque e acompanhe as observações de cada registro.')}
    <section class="metric-grid">${metricCard('Movimentações registradas', movements.length, '<span>histórico demonstrativo</span>', 'chart')}${metricCard('Unidades que entraram', movements.filter((m) => m.type === 'Entrada').reduce((sum, m) => sum + m.quantity, 0), '<span class="accent">entradas somadas</span>', 'down', 'green')}${metricCard('Unidades que saíram', movements.filter((m) => m.type === 'Saída').reduce((sum, m) => sum + m.quantity, 0), '<span>saídas somadas</span>', 'up', 'rose')}${metricCard('Produtos monitorados', products.length, '<span>itens no catálogo</span>', 'box', 'amber')}</section>
    <section class="panel"><div class="panel-heading"><div><h2>Histórico completo</h2><p>Os registros mais recentes aparecem primeiro</p></div><button class="button" type="button" data-refresh-reports>${icon('clock')} Atualizado agora</button></div>
      <div class="filter-bar"><label class="search-field">${icon('search')}<input id="reportSearch" type="search" placeholder="Buscar por produto ou observação..." autocomplete="off" /></label><select class="filter-select" id="typeFilter" aria-label="Filtrar tipo de movimentação"><option value="">Todas as movimentações</option><option value="Entrada">Entradas</option><option value="Saída">Saídas</option></select><span class="result-count" id="reportResultCount"></span></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Código</th><th>Produto</th><th>Movimento</th><th>Quantidade</th><th>Observação</th><th>Data e hora</th></tr></thead><tbody id="reportRows">${movementRows(sorted)}</tbody></table></div>
    </section>`;
}

function render() {
  document.getElementById('breadcrumbCurrent').textContent = viewLabels[currentView];
  document.getElementById('navProductCount').textContent = products.length;
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('is-active', item.dataset.view === currentView));
  document.title = `${viewLabels[currentView]} | Essencial By Dani`;
  if (currentView === 'dashboard') pageContent.innerHTML = renderDashboard();
  if (currentView === 'products') pageContent.innerHTML = renderProducts();
  if (currentView === 'entry' || currentView === 'exit') pageContent.innerHTML = renderMovement(currentView);
  if (currentView === 'reports') pageContent.innerHTML = renderReports();
  if (currentView === 'products') bindProductFilters();
  if (currentView === 'entry' || currentView === 'exit') bindMovementForm();
  if (currentView === 'reports') bindReportFilters();
  renderLucideIcons(pageContent);
}

function setView(view) {
  if (!viewLabels[view]) return;
  currentView = view;
  document.getElementById('sidebar').classList.remove('is-open');
  document.querySelector('.mobile-overlay')?.classList.remove('is-visible');
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
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      const matchesStock = !onlyLowStock || product.quantity <= product.minimum;
      return matchesTerm && matchesCategory && matchesStock;
    });
    rows.innerHTML = productRows(filtered);
    renderLucideIcons(rows);
    count.textContent = `${filtered.length} ${filtered.length === 1 ? 'produto' : 'produtos'}`;
  };
  search.addEventListener('input', update);
  category.addEventListener('change', update);
  lowToggle.classList.toggle('is-active', onlyLowStock);
  lowToggle.setAttribute('aria-pressed', String(onlyLowStock));
  lowToggle.addEventListener('click', () => { onlyLowStock = !onlyLowStock; lowToggle.classList.toggle('is-active', onlyLowStock); lowToggle.setAttribute('aria-pressed', String(onlyLowStock)); update(); });
  update();
}

function updateSelectedProduct() {
  const select = document.getElementById('movementProduct');
  const card = document.getElementById('selectedProductCard');
  if (!select || !card) return;
  const product = productById(select.value);
  if (!product) { card.innerHTML = '<span class="empty-state">Cadastre um produto para registrar movimentações.</span>'; return; }
  const isExit = document.getElementById('movementForm').dataset.movementType === 'Saída';
  const state = stockState(product);
  card.innerHTML = `${productThumb(product)}<span class="product-copy"><b>${escapeHtml(product.name)}</b><small>${escapeHtml(product.category)} · ${escapeHtml(product.supplier)}</small></span><span class="selected-stock" style="color:${state.className === 'status-out' ? 'var(--red-600)' : state.className === 'status-low' ? 'var(--amber-700)' : 'var(--green-600)'}">${product.quantity} un.<small>saldo disponível</small></span>`;
  const quantityInput = document.getElementById('movementQuantity');
  quantityInput.max = isExit ? String(product.quantity) : '';
  quantityInput.placeholder = isExit ? `Até ${product.quantity} unidades` : 'Ex.: 3';
}

function bindMovementForm() {
  const form = document.getElementById('movementForm');
  const select = document.getElementById('movementProduct');
  if (select) select.addEventListener('change', updateSelectedProduct);
  updateSelectedProduct();
  form.addEventListener('reset', () => setTimeout(updateSelectedProduct, 0));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const product = productById(select?.value);
    const rawQuantity = document.getElementById('movementQuantity').value.trim();
    const note = document.getElementById('movementNote').value.trim();
    if (!product) return showToast('Selecione um produto cadastrado.', true);
    if (!/^\d+$/.test(rawQuantity) || Number(rawQuantity) <= 0) return showToast('Informe uma quantidade inteira maior que zero.', true);
    const quantity = Number(rawQuantity);
    const type = form.dataset.movementType;
    if (type === 'Saída' && quantity > product.quantity) return showToast(`Saldo insuficiente. Há ${product.quantity} unidade(s) disponível(is).`, true);
    product.quantity += type === 'Entrada' ? quantity : -quantity;
    movements.unshift({ id: Math.max(1000, ...movements.map((item) => item.id)) + 1, productId: product.id, type, quantity, note: note || (type === 'Entrada' ? 'Entrada de estoque' : 'Saída de estoque'), date: new Date().toISOString() });
    render();
    showToast(`${type} registrada no protótipo. Os dados não são persistidos.`);
  });
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
      const product = productById(movement.productId);
      const matchesText = `${product?.name || ''} ${movement.note}`.toLocaleLowerCase('pt-BR').includes(term);
      return matchesText && (!selectedType || movement.type === selectedType);
    });
    rows.innerHTML = movementRows(filtered, 'Nenhuma movimentação corresponde aos filtros.');
    count.textContent = `${filtered.length} ${filtered.length === 1 ? 'registro' : 'registros'}`;
  };
  search.addEventListener('input', update);
  type.addEventListener('change', update);
  update();
}

function openProductModal(productId = null) {
  const product = productId ? productById(productId) : null;
  const editing = Boolean(product);
  modalRoot.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><div class="modal-header"><div><h2 id="modalTitle">${editing ? 'Editar produto' : 'Novo produto'}</h2><p>${editing ? 'Atualize os dados do cadastro.' : 'Adicione um item ao catálogo de estoque.'}</p></div><button class="icon-button" type="button" data-close-modal aria-label="Fechar">${icon('close')}</button></div>
    <form class="modal-body" id="productForm"><div class="form-grid"><div class="form-field full"><label for="productName">Nome do produto <span class="required">*</span></label><input class="form-control" id="productName" name="name" value="${escapeHtml(product?.name || '')}" required maxlength="100" /></div>
      <div class="form-field"><label for="productCategory">Categoria</label><select class="form-control" id="productCategory" name="category">${categoryOptions.map((category) => `<option ${product?.category === category ? 'selected' : ''}>${escapeHtml(category)}</option>`).join('')}</select></div>
      <div class="form-field"><label for="productSupplier">Fornecedor</label><input class="form-control" id="productSupplier" name="supplier" value="${escapeHtml(product?.supplier || '')}" maxlength="100" /></div>
      <div class="form-field"><label for="productPrice">Preço do produto (R$)</label><input class="form-control" id="productPrice" name="price" type="number" min="0" step="0.01" value="${editing ? product.price : ''}" placeholder="0,00" /></div>
      <div class="form-field"><label for="productQuantity">${editing ? 'Saldo atual' : 'Estoque inicial'}</label><input class="form-control" id="productQuantity" name="quantity" type="number" min="0" step="1" value="${editing ? product.quantity : '0'}" ${editing ? 'disabled' : ''} /><p class="form-hint">${editing ? 'O saldo muda por meio de entradas e saídas.' : 'Você poderá registrar novas entradas depois.'}</p></div>
      <div class="form-field"><label for="productMinimum">Estoque mínimo</label><input class="form-control" id="productMinimum" name="minimum" type="number" min="0" step="1" value="${editing ? product.minimum : '5'}" /></div></div>
      <p class="modal-note">Este formulário é demonstrativo. As alterações ficam somente na memória do navegador até recarregar a página.</p>
      <div class="form-actions"><button class="button" type="button" data-close-modal>Cancelar</button><button class="button button-primary" type="submit">${editing ? 'Salvar alterações' : 'Cadastrar produto'}</button></div></form></div>`;
  renderLucideIcons(modalRoot);
  document.getElementById('productName').focus();
  document.getElementById('productForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') || '').trim();
    const priceRaw = String(formData.get('price') || '0');
    const quantityRaw = String(formData.get('quantity') || '0');
    const minimumRaw = String(formData.get('minimum') || '0');
    const price = Number(priceRaw.replace(',', '.'));
    const quantity = Number(quantityRaw);
    const minimum = Number(minimumRaw);
    if (!name) return showToast('Informe o nome do produto.', true);
    if (!Number.isFinite(price) || price < 0) return showToast('Informe um preço válido.', true);
    if (!Number.isInteger(quantity) || quantity < 0 || !Number.isInteger(minimum) || minimum < 0) return showToast('Saldo e estoque mínimo devem ser números inteiros não negativos.', true);
    const data = { name, category: String(formData.get('category') || ''), supplier: String(formData.get('supplier') || '').trim(), price, minimum };
    if (editing) Object.assign(product, data);
    else products.push({ id: Math.max(0, ...products.map((item) => item.id)) + 1, ...data, quantity });
    modalRoot.innerHTML = '';
    render();
    showToast(editing ? 'Produto atualizado no protótipo.' : 'Produto adicionado ao protótipo.');
  });
}

function showToast(message, isError = false) {
  const region = document.getElementById('toastRegion');
  region.innerHTML = `<div class="toast ${isError ? 'error' : ''}" role="status"><span class="toast-mark">${icon(isError ? 'error' : 'check')}</span><span>${escapeHtml(message)}</span></div>`;
  renderLucideIcons(region);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { region.innerHTML = ''; }, 3200);
}

document.addEventListener('click', (event) => {
  const viewButton = event.target.closest('[data-view]');
  if (viewButton) { event.preventDefault(); setView(viewButton.dataset.view); }
  const editButton = event.target.closest('[data-edit-product]');
  if (editButton) openProductModal(editButton.dataset.editProduct);
  if (event.target.closest('[data-new-product]')) openProductModal();
  if (event.target.closest('[data-close-modal]') || event.target === modalRoot) modalRoot.innerHTML = '';
  if (event.target.closest('[data-refresh-reports]')) showToast('O histórico exibido já está atualizado.');
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') modalRoot.innerHTML = '';
});

document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('is-open');
  document.querySelector('.mobile-overlay')?.classList.toggle('is-visible');
});

const overlay = document.createElement('button');
overlay.className = 'mobile-overlay';
overlay.type = 'button';
overlay.setAttribute('aria-label', 'Fechar menu');
overlay.addEventListener('click', () => { document.getElementById('sidebar').classList.remove('is-open'); overlay.classList.remove('is-visible'); });
document.body.append(overlay);

document.getElementById('topbarDate').textContent = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date());
render();
renderLucideIcons(document);
