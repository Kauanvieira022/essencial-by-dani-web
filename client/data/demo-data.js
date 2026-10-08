const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

export const products = [
  { id: 1, name: 'Aura Floral Intense 100ml', category: 'Perfumes', supplier: 'Distribuidora Bela', price: 189.9, quantity: 6, minimum: 5 },
  { id: 2, name: 'Body Splash Chá Branco', category: 'Perfumes', supplier: 'Essenza Atacado', price: 69.9, quantity: 2, minimum: 4 },
  { id: 3, name: 'Batom Matte Rosa Antigo', category: 'Maquiagem', supplier: 'Make Center', price: 39.9, quantity: 12, minimum: 5 },
  { id: 4, name: 'Sérum Facial Vitamina C', category: 'Cuidados pessoais', supplier: 'Derma Mais', price: 84.9, quantity: 3, minimum: 4 },
  { id: 5, name: 'Máscara de Cílios Volume', category: 'Maquiagem', supplier: 'Make Center', price: 54.9, quantity: 8, minimum: 5 },
  { id: 6, name: 'Hidratante Corporal 400ml', category: 'Cuidados pessoais', supplier: 'Essenza Atacado', price: 49.9, quantity: 0, minimum: 3 },
  { id: 7, name: 'Essência Amadeirada 50ml', category: 'Perfumes', supplier: 'Distribuidora Bela', price: 129.9, quantity: 9, minimum: 4 },
  { id: 8, name: 'Paleta Nude Essencial', category: 'Maquiagem', supplier: 'Make Center', price: 99.9, quantity: 5, minimum: 5 },
];

export const movements = [
  { id: 1004, productId: 3, type: 'Saída', quantity: 1, note: 'Venda no atendimento', date: hoursAgo(1) },
  { id: 1003, productId: 2, type: 'Entrada', quantity: 5, note: 'Reposição do fornecedor', date: hoursAgo(3) },
  { id: 1002, productId: 5, type: 'Saída', quantity: 2, note: 'Venda pelo canal digital', date: hoursAgo(20) },
  { id: 1001, productId: 7, type: 'Entrada', quantity: 4, note: 'Compra semanal', date: hoursAgo(31) },
  { id: 1000, productId: 1, type: 'Saída', quantity: 1, note: 'Venda no atendimento', date: hoursAgo(54) },
];

export const categoryOptions = ['Perfumes', 'Maquiagem', 'Cuidados pessoais'];

export const viewLabels = {
  dashboard: 'Visão geral',
  products: 'Produtos',
  entry: 'Entrada de estoque',
  exit: 'Saída de estoque',
  reports: 'Movimentações',
};
