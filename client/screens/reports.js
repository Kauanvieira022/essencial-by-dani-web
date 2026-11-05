import { escapeHtml, formatMoney, heading, icon, metricCard, movementRows } from '../lib/ui.js';

export function renderReports({ products, movements }) {
  const entries = movements.filter((movement) => movement.type === 'Entrada');
  const exits = movements.filter((movement) => movement.type === 'Saída');
  const entryUnits = entries.reduce((sum, movement) => sum + movement.quantity, 0);
  const exitUnits = exits.reduce((sum, movement) => sum + movement.quantity, 0);
  const entryValue = entries.reduce((sum, movement) => sum + (movement.totalValueCents ?? 0), 0) / 100;
  const exitValue = exits.reduce((sum, movement) => sum + (movement.totalValueCents ?? 0), 0) / 100;
  const sorted = [...movements].sort((a, b) => new Date(b.date) - new Date(a.date));
  const actions = `<button class="button" id="exportCsv" type="button">${icon('download')} Exportar CSV</button><button class="button button-primary" id="exportPdf" type="button">${icon('printer')} Salvar em PDF</button>`;

  return `${heading('Histórico de estoque', 'Movimentações', 'Consulte, filtre e exporte entradas e saídas.', actions)}
    <p class="report-print-meta" id="reportPrintMeta"></p>
    <section class="metric-grid report-metrics" aria-label="Resumo das movimentações">
      ${metricCard('Unidades que entraram', entryUnits, '<span class="accent">entradas somadas</span>', 'down', 'green')}
      ${metricCard('Unidades que saíram', exitUnits, '<span>saídas somadas</span>', 'up', 'rose')}
      ${metricCard('Saldo de unidades', entryUnits - exitUnits, '<span>entradas menos saídas</span>', 'box', 'amber')}
      ${metricCard('Valor das entradas', formatMoney(entryValue), '<span>valores registrados</span>', 'down', 'green')}
      ${metricCard('Valor das saídas', formatMoney(exitValue), '<span>valores registrados</span>', 'up', 'rose')}
    </section>
    <p class="report-note">Movimentações antigas e saldos iniciais sem valor conhecido aparecem com — e não entram nos totais financeiros.</p>
    <section class="panel"><div class="panel-heading"><div><h2>Histórico completo</h2></div></div>
      <div class="filter-bar"><label class="search-field">${icon('search')}<input id="reportSearch" type="search" placeholder="Buscar por produto ou observação..." autocomplete="off" /></label><select class="filter-select" id="typeFilter" aria-label="Filtrar tipo de movimentação"><option value="">Todas as movimentações</option><option value="Entrada">Entradas</option><option value="Saída">Saídas</option></select><select class="filter-select" id="productFilter" aria-label="Filtrar por produto"><option value="">Todos os produtos</option>${products.map((product) => `<option value="${product.id}">${escapeHtml(product.name)}</option>`).join('')}</select><input class="date-filter" id="dateFromFilter" type="date" aria-label="Data inicial" /><input class="date-filter" id="dateToFilter" type="date" aria-label="Data final" /><span class="result-count" id="reportResultCount"></span></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Código</th><th>Produto</th><th>Movimento</th><th>Quantidade</th><th>Valor total</th><th>Observação</th><th>Data e hora</th></tr></thead><tbody id="reportRows">${movementRows(sorted, products)}</tbody></table></div>
    </section>`;
}
