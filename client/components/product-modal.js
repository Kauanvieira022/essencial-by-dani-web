import { escapeHtml, icon } from '../lib/ui.js';

export function renderProductModal(product, categoryOptions) {
  const editing = Boolean(product);
  return `<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><div class="modal-header"><div><h2 id="modalTitle">${editing ? 'Editar produto' : 'Novo produto'}</h2><p>${editing ? 'Atualize os dados do cadastro.' : 'Adicione um item ao catálogo.'}</p></div><button class="icon-button" type="button" data-close-modal aria-label="Fechar">${icon('close')}</button></div>
    <form class="modal-body" id="productForm"><div class="form-grid"><div class="form-field full"><label for="productName">Nome do produto <span class="required">*</span></label><input class="form-control" id="productName" name="name" value="${escapeHtml(product?.name || '')}" required maxlength="100" /></div>
      <div class="form-field"><label for="productCategory">Categoria</label><select class="form-control" id="productCategory" name="category">${categoryOptions.map((category) => `<option ${product?.category === category || (!editing && category === categoryOptions[0]) ? 'selected' : ''}>${escapeHtml(category)}</option>`).join('')}</select></div>
      <div class="form-field"><label for="productSupplier">Fornecedor</label><input class="form-control" id="productSupplier" name="supplier" value="${escapeHtml(product?.supplier || '')}" maxlength="100" /></div>
      <div class="form-field"><label for="productPrice">Preço do produto (R$)</label><input class="form-control" id="productPrice" name="price" type="number" min="0" step="0.01" value="${editing ? product.price : ''}" placeholder="0,00" /></div>
      <div class="form-field"><label for="productQuantity">${editing ? 'Saldo atual' : 'Estoque inicial'}</label><input class="form-control" id="productQuantity" name="quantity" type="number" min="0" step="1" value="${editing ? product.quantity : '0'}" ${editing ? 'disabled' : ''} /><p class="form-hint">${editing ? 'Ajuste o saldo por meio de entradas e saídas.' : 'Novas entradas podem ser registradas depois.'}</p></div>
      <div class="form-field"><label for="productMinimum">Estoque mínimo</label><input class="form-control" id="productMinimum" name="minimum" type="number" min="0" step="1" value="${editing ? product.minimum : '5'}" /></div></div>
      <p class="modal-note">Os dados deste protótipo ficam na memória e são reiniciados ao recarregar a página.</p>
      <div class="form-actions"><button class="button" type="button" data-close-modal>Cancelar</button><button class="button button-primary" type="submit">${editing ? 'Salvar alterações' : 'Cadastrar produto'}</button></div></form></div>`;
}
