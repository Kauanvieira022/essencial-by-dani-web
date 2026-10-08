# Essencial By Dani — sistema web de gestão de estoque

## O que é

O Essencial By Dani é um sistema web para organizar o estoque da loja. A proposta é reunir o catálogo de produtos, os saldos disponíveis, os alertas de reposição e o histórico de entradas e saídas em uma única interface.

O projeto usa HTML, CSS e JavaScript no front-end, Node.js e Express no servidor e SQLite como banco de dados. O navegador não acessa o arquivo do banco diretamente: a comunicação é feita por uma API no servidor. O acesso é restrito a uma conta com a função **Admin**, usada pela dona da loja.

## Como usar o sistema

### 1. Configurar o ambiente

Copie `.env.example` para `.env` na raiz do projeto. No PowerShell:

```powershell
Copy-Item .env.example .env
```

Preencha `ADMIN_EMAIL` e `ADMIN_PASSWORD` com as credenciais da administradora. A senha deve ter de 12 a 128 caracteres. Gere um segredo para as sessões com:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Copie o resultado para `SESSION_SECRET`. O segredo precisa ter pelo menos 32 bytes. `DATABASE_PATH` é opcional; vazio, o banco fica na pasta de dados local do usuário. O `.env` está no `.gitignore`; não coloque credenciais reais no `.env.example` nem no repositório.

Se a senha contiver `#` ou espaços, coloque o valor entre aspas no `.env`.

Em produção, configure `NODE_ENV=production` e use HTTPS. Isso ativa o atributo `Secure` no cookie de sessão.

### 2. Iniciar o sistema

É necessário ter Node.js 22 ou superior instalado. Na pasta do projeto, execute:

```sh
npm install
npm run dev
```

Abra `http://localhost:3000` no navegador. O servidor inicializa o esquema SQLite e disponibiliza a rota `GET /api/health`. Na primeira execução, o catálogo e o histórico começam vazios; não há registros de exemplo.

### 3. Entrar como Admin

Informe o e-mail e a senha configurados no `.env`. Existe apenas a função Admin, sem cadastro público de usuários. A sessão expira após 12 horas; use **Sair** no cabeçalho para encerrá-la antes.

### 4. Consultar a visão geral

Na tela **Visão geral**, confira a quantidade de produtos e unidades, os itens que precisam de reposição, o saldo por categoria e as movimentações recentes. Se ainda não houver produtos, use **Cadastrar produto**. Os atalhos de entrada e saída ficam disponíveis para os próximos registros.

### 5. Cadastrar e localizar produtos

Abra **Produtos** no menu lateral e selecione **Novo produto**. Informe o nome, a categoria e o estoque mínimo. Fornecedor e preço são opcionais; informe o estoque inicial se houver saldo. Se o estoque inicial for maior que zero, o sistema registra também a entrada inicial no histórico. Para alterar um cadastro, use o botão de edição na linha do produto.

Na mesma tela, pesquise por nome, categoria ou fornecedor. Também é possível filtrar por categoria ou mostrar apenas produtos no mínimo ou abaixo dele.

### 6. Registrar uma entrada

Abra **Entrada de estoque**, escolha o produto, informe a quantidade recebida e, se quiser, adicione uma observação, como a reposição do fornecedor. Confirme a entrada para atualizar o saldo no banco e incluir o registro no histórico. A confirmação mostra o novo saldo e oferece atalhos para outra movimentação ou para o histórico. Se não houver produtos, use **Cadastrar primeiro produto**.

### 7. Registrar uma saída

Abra **Saída de estoque**, escolha um produto que tenha saldo, informe a quantidade retirada e, opcionalmente, escreva uma observação. Produtos sem saldo ficam indisponíveis e a quantidade não pode ultrapassar o saldo atual. Confirme a saída para atualizar o saldo no banco e registrar a movimentação. A confirmação mostra o novo saldo e oferece atalhos para outra movimentação ou para o histórico.

### 8. Consultar movimentações

Abra **Movimentações** para consultar entradas e saídas. Use a busca para localizar registros por produto ou observação; os filtros permitem restringir por tipo, produto e período. Os registros mais recentes aparecem primeiro.

O menu lateral permite alternar entre as telas; os botões voltar e avançar do navegador também acompanham a navegação.

> **Atenção:** o sistema inicia sem produtos ou movimentações de exemplo. Cadastros e movimentações são gravados no SQLite e continuam disponíveis depois de fechar ou recarregar a página.

## Organização do projeto

- `.env.example`: modelo sem credenciais para criar o `.env` local.
- `client/data`: estado carregado pela API, categorias disponíveis e rótulos das telas.
- `client/lib/api.js`: comunicação do navegador com as rotas do servidor.
- `client/components`: componentes reutilizáveis, como o formulário de produto e os avisos.
- `client/lib`: formatação, ícones e elementos compartilhados da interface.
- `client/screens`: apresentação de cada tela, incluindo o login.
- `client/app.js`: navegação e coordenação das ações e dos formulários.
- `server`: configuração privada, autenticação, rotas da API, banco SQLite, serialização dos registros e esquema das tabelas.

O front-end usa módulos JavaScript nativos, sem framework ou etapa de compilação.

## Banco de dados e estado atual

O servidor cria as tabelas `products`, `stock_movements` e `auth_sessions` na inicialização. O preço é armazenado em centavos para evitar imprecisão decimal, e as movimentações mantêm vínculo com o produto.

Por padrão, o arquivo SQLite fica fora do repositório, na pasta de dados local do usuário. A variável de ambiente `DATABASE_PATH` permite definir outro caminho. O banco e os arquivos auxiliares não devem ser versionados.

As telas usam a API para autenticar a administradora, listar e cadastrar produtos, editar cadastros, criar movimentações e consultar o histórico. As rotas de produtos e movimentações exigem uma sessão válida. A senha não é armazenada no SQLite; o servidor mantém sessões com tokens aleatórios, salva somente o HMAC do token e usa um cookie `HttpOnly`, `SameSite=Strict`, com validade de 12 horas. Após cinco tentativas de login incorretas, novas tentativas do mesmo endereço ficam temporariamente limitadas.

Para trocar a senha, atualize `ADMIN_PASSWORD` no `.env` e reinicie o servidor. Para invalidar também as sessões abertas, gere um novo `SESSION_SECRET` e reinicie o sistema.

## Padrões visuais

- **Ícones:** biblioteca Lucide, instalada como dependência local. Os ícones usam traço de 1,8 px e tamanhos definidos por contexto: 12, 16, 20 ou 24 px.
- **Tipografia:** DM Sans em toda a interface, incluindo marca, títulos e destaques. As alternativas são Segoe UI, Arial e fontes genéricas sem serifa.
- **Escala:** tamanhos de texto, espaçamentos, alturas de controles e raios de borda ficam centralizados como variáveis CSS em `styles.css`. A escala de espaçamento parte de 4 px.

## Decisões pendentes

O cadastro inclui o preço do produto, conforme o sistema de referência. O documento também menciona “valores” das movimentações, mas não esclarece se são valores monetários ou quantidades. Por isso, as telas de entrada e saída mostram quantidade e observação; o significado de valores por movimentação precisa ser definido antes da implementação dessa regra.

As categorias disponíveis estão definidas no protótipo. A paleta azul e rosa é provisória e deriva das cores usadas na janela principal do aplicativo de referência; não substitui um guia oficial de marca.
