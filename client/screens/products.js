import { escapeHtml, heading, icon, productRows } from '../lib/ui.js';

export function renderProducts({ products, categoryOptions }) {
  return `${heading('Catálogo', 'Produtos', 'Pesquise o catálogo e identifique os itens que precisam de reposição.', `<button class="button button-primary" type="button" data-new-product>${icon('plus')} Novo produto</button>`)}
    <section class="panel"><div class="panel-heading"><div><h2>Todos os produtos</h2><p>Pesquise por nome, categoria ou fornecedor</p></div></div>
      <div class="filter-bar"><label class="search-field">${icon('search')}<input id="productSearch" type="search" placeholder="Buscar produto..." autocomplete="off" /></label><select class="filter-select" id="categoryFilter" aria-label="Filtrar por categoria"><option value="">Todas as categorias</option>${categoryOptions.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('')}</select><button class="filter-toggle" id="lowStockToggle" type="button" aria-pressed="false">${icon('alert')} Estoque baixo</button><span class="result-count" id="productResultCount"></span></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Produto</th><th>Categoria</th><th>Fornecedor</th><th>Preço</th><th>Saldo</th><th>Status</th><th>Ação</th></tr></thead><tbody id="productRows">${productRows(products)}</tbody></table></div>
    </section>`;
}
