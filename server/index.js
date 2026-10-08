const express = require('express');
const path = require('node:path');
require('./database');

const app = express();
const projectRoot = path.resolve(__dirname, '..');
const port = Number(process.env.PORT || 3000);

app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', banco: 'SQLite' });
});

app.get('/vendor/lucide.js', (_request, response) => {
  response.sendFile(path.join(projectRoot, 'node_modules', 'lucide', 'dist', 'umd', 'lucide.min.js'));
});

app.get('/', (_request, response) => {
  response.sendFile(path.join(projectRoot, 'index.html'));
});

app.get('/styles.css', (_request, response) => {
  response.sendFile(path.join(projectRoot, 'styles.css'));
});

app.get('/app.js', (_request, response) => {
  response.sendFile(path.join(projectRoot, 'app.js'));
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
