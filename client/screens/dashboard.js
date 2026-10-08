import { escapeHtml, icon, metricCard, movementRows } from '../lib/ui.js';

export function renderDashboard({ products, movements, categoryOptions }) {
  const lowProducts = products.filter((product) => product.quantity <= product.minimum).sort((a, b) => a.quantity - b.quantity);
  const totalUnits = products.reduce((sum, product) => sum + product.quantity, 0);
  const entryUnits = movements.filter((item) => item.type === 'Entrada').reduce((sum, item) => sum + item.quantity, 0);
  const exitUnits = movements.filter((item) => item.type === 'Saída').reduce((sum, item) => sum + item.quantity, 0);
  const categoryTotals = categoryOptions.map((category) => ({ category, quantity: products.filter((product) => product.category === category).reduce((sum, product) => sum + product.quantity, 0) }));
  const maxCategory = Math.max(1, ...categoryTotals.map((item) => item.quantity));
  const latest = [...movements].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);

  return `<section class="welcome-banner"><div class="welcome-content"><h1>Resumo do estoque</h1><p>Acompanhe saldos, reposições e movimentações.</p></div><div class="welcome-actions"><button class="button button-primary" data-view="entry" type="button">${icon('down')} Registrar entrada</button><button class="button" data-view="exit" type="button">${icon('up')} Registrar saída</button></div></section>
    <section class="metric-grid" aria-label="Resumo do estoque">
      ${metricCard('Produtos cadastrados', products.length, '<span>itens no catálogo</span>', 'box')}
      ${metricCard('Unidades em estoque', totalUnits, '<span class="accent">saldo atual</span>', 'grid', 'green')}
      ${metricCard('Atenção para reposição', lowProducts.length, '<span class="warn">no mínimo ou abaixo</span>', 'alert', 'amber')}
      ${metricCard('Movimentos registrados', movements.length, `<span>+${entryUnits} entradas · −${exitUnits} saídas</span>`, 'chart', 'rose')}
    </section>
    <section class="dashboard-grid">
      <article class="panel"><div class="panel-heading"><div><h2>Saldo por categoria</h2></div><button class="text-link" type="button" data-view="products">Ver produtos →</button></div>
        <div class="category-list">${products.length ? categoryTotals.map((item) => `<div class="category-row"><span class="category-name">${escapeHtml(item.category)}</span><span class="progress-track"><span class="progress-bar" style="width:${Math.max(2, item.quantity / maxCategory * 100)}%"></span></span><span class="category-quantity">${item.quantity}<small>unidades</small></span></div>`).join('') : '<div class="empty-state">Cadastre um produto para ver o saldo por categoria.<br /><button class="text-link" type="button" data-new-product>Cadastrar produto →</button></div>'}</div>
      </article>
      <article class="panel"><div class="panel-heading"><div><h2>Reposição necessária</h2></div><button class="text-link" type="button" data-view="products" data-low-stock-link>Ver lista →</button></div>
        <div class="low-stock-list">${lowProducts.length ? lowProducts.slice(0, 4).map((product) => `<div class="low-stock-item"><span class="low-stock-copy"><b>${escapeHtml(product.name)}</b><small>${escapeHtml(product.category)}</small></span><span class="stock-amount">${product.quantity} un.<small>mín. ${product.minimum}</small></span></div>`).join('') : `<div class="empty-state">${products.length ? 'Nenhum produto precisa de reposição.' : 'Os alertas aparecerão depois do cadastro de produtos.'}</div>`}</div>
      </article>
    </section>
    <section class="panel movement-panel"><div class="panel-heading"><div><h2>Movimentações recentes</h2></div><button class="text-link" type="button" data-view="reports">Ver histórico →</button></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Código</th><th>Produto</th><th>Movimento</th><th>Quantidade</th><th>Observação</th><th>Data e hora</th></tr></thead><tbody>${movementRows(latest, products)}</tbody></table></div>
    </section>`;
}
