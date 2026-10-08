const fs = require('node:fs');
const express = require('express');
const path = require('node:path');
const { loadEnvFile } = require('node:process');

const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) loadEnvFile(envPath);

const config = require('./config');
const database = require('./database');
const createProductsRouter = require('./routes/products');
const createMovementsRouter = require('./routes/movements');
const { createAuthRouter, requireAdmin } = require('./routes/auth');

const app = express();
const projectRoot = path.resolve(__dirname, '..');
const port = config.port;
const adminOnly = requireAdmin(database);

app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));
app.use('/client', express.static(path.join(projectRoot, 'client'), { dotfiles: 'deny', index: false }));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', banco: 'SQLite' });
});

app.use('/api/auth', createAuthRouter(database));
app.use('/api/products', adminOnly, createProductsRouter(database));
app.use('/api/movements', adminOnly, createMovementsRouter(database));

app.get('/vendor/lucide.js', (_request, response) => {
  response.sendFile(path.join(projectRoot, 'node_modules', 'lucide', 'dist', 'umd', 'lucide.min.js'));
});

app.get('/', (_request, response) => {
  response.sendFile(path.join(projectRoot, 'index.html'));
});

app.get('/styles.css', (_request, response) => {
  response.sendFile(path.join(projectRoot, 'styles.css'));
});

app.use('/api', (_request, response) => {
  response.status(404).json({ erro: 'Rota da API não encontrada.' });
});

app.use((_request, response) => {
  response.status(404).send('Página não encontrada.');
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Sistema disponível em http://localhost:${port}`);
  });
}

module.exports = app;
