const express = require('express');
const { serializeProduct, serializeMovement } = require('../serializers');

const productColumns = `id, name, category, supplier, price_cents, stock_quantity, minimum_stock, created_at, updated_at`;
const movementColumns = `m.id, m.product_id, p.name AS product_name, m.type, m.quantity, m.observation, m.created_at`;

function parseId(value) {
  if (!/^\d+$/.test(String(value))) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function isDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function nextUtcDay(value) {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString();
}

function parseMovement(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Envie os dados da movimentação em formato JSON.' };

  const productId = parseId(body.productId);
  const typeValue = typeof body.type === 'string' ? body.type.trim().toLocaleLowerCase('pt-BR') : '';
  const type = typeValue === 'entrada' ? 'entrada' : typeValue === 'saida' || typeValue === 'saída' ? 'saida' : null;
  const quantity = body.quantity;
  const observation = body.note === undefined ? '' : typeof body.note === 'string' ? body.note.trim() : null;

  if (!productId) return { error: 'Selecione um produto válido.' };
  if (!type) return { error: 'O tipo deve ser entrada ou saída.' };
  if (!Number.isSafeInteger(quantity) || quantity <= 0) return { error: 'A quantidade deve ser um inteiro maior que zero.' };
  if (observation === null || observation.length > 240) return { error: 'A observação deve ter até 240 caracteres.' };

  return { value: { productId, type, quantity, observation } };
}

function createMovementsRouter(database) {
  const router = express.Router();
  const getProduct = database.prepare(`SELECT ${productColumns} FROM products WHERE id = ?`);
  const getMovement = database.prepare(`SELECT ${movementColumns} FROM stock_movements m JOIN products p ON p.id = m.product_id WHERE m.id = ?`);

  router.get('/', (request, response) => {
    const { type, productId, from, to, q } = request.query;
    const conditions = [];
    const parameters = [];

    if (type !== undefined) {
      if (!['entrada', 'saida'].includes(type)) return response.status(400).json({ erro: 'Tipo de movimentação inválido.' });
      conditions.push('m.type = ?');
      parameters.push(type);
    }
    if (productId !== undefined) {
      const parsedProductId = parseId(productId);
      if (!parsedProductId) return response.status(400).json({ erro: 'Identificador de produto inválido.' });
      conditions.push('m.product_id = ?');
      parameters.push(parsedProductId);
    }
    if (from !== undefined) {
      if (!isDateOnly(from)) return response.status(400).json({ erro: 'Data inicial inválida.' });
      conditions.push('m.created_at >= ?');
      parameters.push(`${from}T00:00:00.000Z`);
    }
    if (to !== undefined) {
      if (!isDateOnly(to)) return response.status(400).json({ erro: 'Data final inválida.' });
      conditions.push('m.created_at < ?');
      parameters.push(nextUtcDay(to));
    }
    if (from && to && from > to) return response.status(400).json({ erro: 'A data inicial deve ser anterior ou igual à data final.' });
    if (q !== undefined) {
      if (typeof q !== 'string' || q.length > 100) return response.status(400).json({ erro: 'A busca deve ter até 100 caracteres.' });
      const term = `%${q.trim()}%`;
      conditions.push('(p.name LIKE ? COLLATE NOCASE OR m.observation LIKE ? COLLATE NOCASE)');
      parameters.push(term, term);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = database.prepare(`SELECT ${movementColumns} FROM stock_movements m JOIN products p ON p.id = m.product_id ${where} ORDER BY m.created_at DESC, m.id DESC`).all(...parameters);
    response.json(rows.map(serializeMovement));
  });

  router.post('/', (request, response) => {
    const { value, error } = parseMovement(request.body);
    if (error) return response.status(400).json({ erro: error });

    try {
      const create = database.transaction((movement) => {
        const product = getProduct.get(movement.productId);
        if (!product) {
          const notFound = new Error('Produto não encontrado.');
          notFound.status = 404;
          throw notFound;
        }
        if (movement.type === 'saida' && movement.quantity > product.stock_quantity) {
          const insufficient = new Error(`Saldo insuficiente. Há ${product.stock_quantity} unidade(s) disponível(is).`);
          insufficient.status = 409;
          throw insufficient;
        }
        if (movement.type === 'entrada' && movement.quantity > Number.MAX_SAFE_INTEGER - product.stock_quantity) {
          const overflow = new Error('A quantidade ultrapassa o limite de saldo permitido.');
          overflow.status = 409;
          throw overflow;
        }

        const newQuantity = product.stock_quantity + (movement.type === 'entrada' ? movement.quantity : -movement.quantity);
        database.prepare(`UPDATE products SET stock_quantity = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`)
          .run(newQuantity, movement.productId);
        const inserted = database.prepare(`INSERT INTO stock_movements (product_id, type, quantity, observation) VALUES (?, ?, ?, ?)`)
          .run(movement.productId, movement.type, movement.quantity, movement.observation);

        return {
          movement: serializeMovement(getMovement.get(Number(inserted.lastInsertRowid))),
          product: serializeProduct(getProduct.get(movement.productId)),
        };
      });

      response.status(201).json(create(value));
    } catch (error) {
      if (error.status) return response.status(error.status).json({ erro: error.message });
      console.error('Falha ao registrar movimentação:', error);
      response.status(500).json({ erro: 'Não foi possível registrar a movimentação.' });
    }
  });

  return router;
}

module.exports = createMovementsRouter;
