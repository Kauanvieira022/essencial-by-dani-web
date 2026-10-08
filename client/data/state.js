export const products = [];
export const movements = [];

export function replaceProducts(records) {
  products.splice(0, products.length, ...records);
}

export function replaceMovements(records) {
  movements.splice(0, movements.length, ...records);
}

export const categoryOptions = ['Perfumes', 'Maquiagem', 'Cuidados pessoais'];

export const viewLabels = {
  dashboard: 'Visão geral',
  products: 'Produtos',
  entry: 'Entrada de estoque',
  exit: 'Saída de estoque',
  reports: 'Movimentações',
};
