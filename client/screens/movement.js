import { escapeHtml, heading, icon } from '../lib/ui.js';

export function renderMovement(view, products) {
  const isEntry = view === 'entry';
  const type = isEntry ? 'Entrada' : 'Saída';
  const title = isEntry ? 'Registrar entrada' : 'Registrar saída';
  const subtitle = isEntry ? 'Atualize o saldo de produtos recebidos.' : 'Registre produtos retirados e confira o saldo disponível.';
  const options = products.map((product) => `<option value="${product.id}" ${!isEntry && product.quantity === 0 ? 'disabled' : ''}>${escapeHtml(product.name)} — ${product.quantity} un. disponíveis</option>`).join('');
  return `${heading('Estoque', title, subtitle)}
    <section class="movement-layout"><article class="panel movement-form-panel">
      <form id="movementForm" data-movement-type="${type}"><div class="form-grid">
        <div class="form-field full"><label for="movementProduct">Produto <span class="required">*</span></label><select class="form-control" id="movementProduct" required ${products.length ? '' : 'disabled'}>${products.length ? `<option value="" selected disabled>Selecione um produto</option>${options}` : '<option value="">Cadastre um produto antes de movimentar o estoque</option>'}</select></div>
        <div class="form-field"><label for="movementQuantity">Quantidade <span class="required">*</span></label><input class="form-control" id="movementQuantity" type="number" min="1" step="1" inputmode="numeric" placeholder="Ex.: 3" required /></div>
        <div class="form-field full"><label for="movementNote">Observação <span class="optional">(opcional)</span></label><textarea class="form-control" id="movementNote" maxlength="240" placeholder="Ex.: reposição ou venda"></textarea></div>
      </div><div class="form-actions"><button class="button" type="reset">Limpar campos</button><button class="button button-primary" type="submit">${icon(isEntry ? 'down' : 'up')} Confirmar ${isEntry ? 'entrada' : 'saída'}</button></div></form>
    </article></section>`;
}
