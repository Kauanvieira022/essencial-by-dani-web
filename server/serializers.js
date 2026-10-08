function serializeProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    supplier: row.supplier,
    price: row.price_cents / 100,
    quantity: row.stock_quantity,
    minimum: row.minimum_stock,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function serializeMovement(row) {
  if (!row) return null;
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    type: row.type === 'entrada' ? 'Entrada' : 'Saída',
    quantity: row.quantity,
    note: row.observation,
    date: row.created_at,
  };
}

module.exports = { serializeProduct, serializeMovement };
