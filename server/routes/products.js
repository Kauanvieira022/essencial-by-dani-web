const express = require('express');
const { serializeProduct, serializeMovement } = require('../serializers');

const productColumns = `id, name, category, supplier, price_cents, stock_quantity, minimum_stock, created_at, updated_at`;
const movementColumns = `m.id, m.product_id, p.name AS product_name, m.type, m.quantity, m.observation, m.created_at`;

function parseProduct(body, includeQuantity) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Envie os dados do produto em formato JSON.' };

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const supplier = body.supplier === undefined ? '' : typeof body.supplier === 'string' ? body.supplier.trim() : null;
  const price = body.price === undefined ? 0 : body.price;
  const quantity = includeQuantity ? (body.quantity === undefined ? 0 : body.quantity) : undefined;
  const minimum = body.minimum;

  if (!name || name.length > 100) return { error: 'Informe um nome de produto com até 100 caracteres.' };
  if (!category || category.length > 80) return { error: 'Selecione uma categoria válida.' };
  if (supplier === null || supplier.length > 100) return { error: 'O fornecedor deve ter até 100 caracteres.' };
  if (typeof price !== 'number' || !Number.isFinite(price) || price < 0 || !Number.isSafeInteger(Math.round(price * 100))) return { error: 'Informe um preço válido.' };
  if (includeQuantity && (!Number.isSafeInteger(quantity) || quantity < 0)) return { error: 'O estoque inicial deve ser um inteiro não negativo.' };
  if (!Number.isSafeInteger(minimum) || minimum < 0) return { error: 'O estoque mínimo deve ser um inteiro não negativo.' };

  return { value: { name, category, supplier, priceCents: Math.round(price * 100), quantity, minimum } };
}

function parseId(value) {
  if (!/^\d+$/.test(String(value))) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function createProductsRouter(database) {
  const router = express.Router();
  const getProduct = database.prepare(`SELECT ${productColumns} FROM products WHERE id = ?`);
  const getMovement = database.prepare(`SELECT ${movementColumns} FROM stock_movements m JOIN products p ON p.id = m.product_id WHERE m.id = ?`);

  router.get('/', (_request, response) => {
    const rows = database.prepare(`SELECT ${productColumns} FROM products ORDER BY name COLLATE NOCASE, id`).all();
    response.json(rows.map(serializeProduct));
  });

  router.get('/:id', (request, response) => {
    const id = parseId(request.params.id);
    if (!id) return response.status(400).json({ erro: 'Identificador de produto inválido.' });
    const product = getProduct.get(id);
    if (!product) return response.status(404).json({ erro: 'Produto não encontrado.' });
    response.json(serializeProduct(product));
  });

  router.post('/', (request, response) => {
    const { value, error } = parseProduct(request.body, true);
    if (error) return response.status(400).json({ erro: error });

    try {
      const create = database.transaction((product) => {
        const inserted = database.prepare(`INSERT INTO products (name, category, supplier, price_cents, stock_quantity, minimum_stock) VALUES (?, ?, ?, ?, ?, ?)`)
          .run(product.name, product.category, product.supplier, product.priceCents, product.quantity, product.minimum);
        const id = Number(inserted.lastInsertRowid);
        let initialMovement = null;

        if (product.quantity > 0) {
          const movement = database.prepare(`INSERT INTO stock_movements (product_id, type, quantity, observation) VALUES (?, 'entrada', ?, 'Estoque inicial')`)
            .run(id, product.quantity);
          initialMovement = serializeMovement(getMovement.get(Number(movement.lastInsertRowid)));
        }

        return { product: serializeProduct(getProduct.get(id)), initialMovement };
      });
      response.status(201).json(create(value));
    } catch (error) {
      console.error('Falha ao cadastrar produto:', error);
      response.status(500).json({ erro: 'Não foi possível cadastrar o produto.' });
    }
  });

  router.put('/:id', (request, response) => {
    const id = parseId(request.params.id);
    if (!id) return response.status(400).json({ erro: 'Identificador de produto inválido.' });
    if (!getProduct.get(id)) return response.status(404).json({ erro: 'Produto não encontrado.' });

    const { value, error } = parseProduct(request.body, false);
    if (error) return response.status(400).json({ erro: error });

    try {
      database.prepare(`UPDATE products SET name = ?, category = ?, supplier = ?, price_cents = ?, minimum_stock = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`)
        .run(value.name, value.category, value.supplier, value.priceCents, value.minimum, id);
      response.json(serializeProduct(getProduct.get(id)));
    } catch (error) {
      console.error('Falha ao atualizar produto:', error);
      response.status(500).json({ erro: 'Não foi possível atualizar o produto.' });
    }
  });

  return router;
}

module.exports = createProductsRouter;
