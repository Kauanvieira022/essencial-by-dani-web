# Essencial By Dani — Gestão de estoque

Aplicação web local para manter o catálogo de produtos da Essencial By Dani, acompanhar saldos e registrar entradas e saídas de estoque. Os dados ficam em um banco SQLite no computador em que o sistema é executado.

O navegador apresenta as telas e conversa com uma API local em Node.js e Express. O front-end usa HTML, CSS e módulos JavaScript nativos; não há etapa de compilação. O projeto usa a biblioteca Lucide para ícones e DM Sans como tipografia principal, com fontes sem serifa locais como alternativa. DM Sans é carregada pelo Google Fonts quando há conexão; sem internet, a interface usa as fontes locais de fallback.

## Estado atual

O fluxo principal de gestão está implementado:

- painel com resumo do estoque, alertas de reposição e movimentações recentes;
- cadastro e edição de produtos;
- pesquisa por produto, categoria e fornecedor;
- filtro por categoria e por estoque no mínimo ou abaixo dele;
- registro de entradas e saídas com quantidade, valor financeiro total e observação;
- validação do saldo disponível para impedir saídas maiores que o estoque;
- histórico de movimentações com busca, filtros e totais do período filtrado;
- exportação dos resultados filtrados para CSV;
- impressão do histórico filtrado ou uso da opção **Salvar como PDF** do navegador;
- interface responsiva para telas maiores e dispositivos móveis;
- armazenamento persistente em SQLite, sem produtos ou movimentações de demonstração.

O sistema não possui tela de login. A versão atual foi preparada para uso local em um único computador e o servidor escuta somente em `127.0.0.1`. Ela não deve ser publicada na internet nem disponibilizada na rede local sem autenticação, autorização e revisão de segurança.

## Requisitos

- Node.js 22 ou superior;
- npm, incluído na instalação do Node.js;
- navegador moderno, como Chrome ou Edge.

Confira as versões instaladas:

```sh
node --version
npm --version
```

O pacote `better-sqlite3` inclui uma dependência nativa. O `npm ci` normalmente instala um binário compatível com a versão do Node; se precisar compilar a dependência no Windows, instale as ferramentas de compilação C++ exigidas pelo Node.js.

## Instalação e inicialização

Execute os comandos no diretório raiz do projeto, onde está o `package.json`.

### Windows — PowerShell

```powershell
Set-Location -LiteralPath 'C:\caminho\para\Essencial By Dani - Web'
npm ci
if (-not (Test-Path -LiteralPath '.env')) { Copy-Item -LiteralPath '.env.example' -Destination '.env' }
npm run dev
```

Abra [http://127.0.0.1:3000](http://127.0.0.1:3000). Para encerrar o servidor, pressione **Ctrl+C** no terminal em que ele está rodando.

Se a pasta do projeto estiver no caminho usado neste computador, o primeiro comando pode ser:

```powershell
Set-Location -LiteralPath 'C:\Users\kauan\OneDrive\Documentos\ChatGPT\Essencial By Dani - Web'
```

### macOS ou Linux

```sh
cd "/caminho/para/Essencial By Dani - Web"
npm ci
if [ ! -f .env ]; then cp .env.example .env; fi
npm run dev
```

O arquivo `.env` é opcional: se ele não existir, o sistema usa os valores padrão. O exemplo de criação acima preserva um `.env` que já exista. Nesta versão não há chaves de API, senhas ou credenciais para configurar, pois o sistema não tem login.

### Modos de execução

| Comando | Uso |
| --- | --- |
| `npm run dev` | Inicia o servidor com reinicialização automática quando arquivos do servidor mudam. Recomendado durante o desenvolvimento. |
| `npm start` | Inicia o servidor sem o modo de observação. |

Os dois modos servem a interface e a API. Não abra `index.html` diretamente pelo sistema de arquivos: as telas precisam da API e dos arquivos servidos pelo Express.

## Configuração

As configurações locais ficam em `.env`, que está ignorado pelo Git. Use `.env.example` como modelo e nunca adicione banco de dados, credenciais ou cópias de segurança ao repositório.

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `PORT` | `3000` | Porta HTTP. O valor deve ser um número inteiro entre `1` e `65535`. |
| `DATABASE_PATH` | Caminho local do usuário | Caminho opcional do arquivo SQLite. Pode ser absoluto; caminhos relativos são resolvidos a partir do diretório em que o comando é executado. |
| `NODE_ENV` | `development` no exemplo | A lógica da aplicação não define fluxos diferentes com base nessa variável. |

Exemplo de configuração:

```dotenv
PORT=3000
DATABASE_PATH=C:/dados/essencial-by-dani.sqlite
```

Se `DATABASE_PATH` ficar vazio, o banco é criado fora do projeto:

- **Windows:** `%LOCALAPPDATA%\essencial-by-dani\essencial-by-dani.sqlite`;
- **macOS/Linux:** `$XDG_DATA_HOME/essencial-by-dani/essencial-by-dani.sqlite`, quando `XDG_DATA_HOME` estiver definido; caso contrário, `~/.local/share/essencial-by-dani/essencial-by-dani.sqlite`.

O servidor cria automaticamente a pasta do banco. Para evitar conflitos de sincronização e bloqueios do SQLite em modo WAL, mantenha o banco em um disco local, fora de pastas sincronizadas como OneDrive, e não compartilhe o mesmo arquivo entre várias instâncias do sistema.

O processo lê `.env` com o recurso nativo do Node.js. Variáveis de ambiente definidas no terminal têm precedência sobre as do arquivo. O servidor sempre se vincula a `127.0.0.1`; alterar `PORT` muda a porta, mas não torna o sistema acessível por outros dispositivos.

## Como usar

### 1. Conferir o painel

Ao abrir o sistema, o painel **Visão geral** mostra a quantidade de produtos, as unidades em estoque, os itens que precisam de reposição e os movimentos registrados. Também oferece atalhos para entrada, saída e consulta ao histórico.

### 2. Cadastrar produtos

1. Abra **Produtos** e selecione **Novo produto**.
2. Informe o nome, a categoria e o estoque mínimo. Fornecedor e preço do produto são opcionais.
3. Se necessário, informe um estoque inicial e salve.

As categorias disponíveis nesta versão são **Perfumes**, **Maquiagem** e **Cuidados pessoais**. O estoque inicial maior que zero atualiza o saldo e gera uma movimentação inicial; como não há valor financeiro conhecido nesse cadastro, seu valor aparece como não informado. A tela permite editar os dados do produto, mas o saldo deve ser ajustado por movimentações.

### 3. Registrar uma entrada

1. Abra **Entrada de estoque**.
2. Selecione o produto e informe a quantidade recebida.
3. Informe o valor total pago nessa reposição. Esse valor é próprio da movimentação e não é calculado pelo preço cadastrado do produto.
4. Opcionalmente, adicione uma observação e confirme.

O saldo é atualizado e a movimentação aparece no painel e no histórico.

### 4. Registrar uma saída

1. Abra **Saída de estoque**.
2. Selecione um produto com saldo e informe a quantidade retirada.
3. Informe o valor total recebido. Use `0,00` quando a saída não tiver valor financeiro.
4. Opcionalmente, adicione uma observação e confirme.

O sistema recusa uma saída maior que o saldo disponível e não permite saldo negativo.

### 5. Consultar e exportar movimentações

Em **Movimentações**, use a busca por nome do produto ou observação e os filtros de tipo, produto e período. Os indicadores e a lista refletem os filtros aplicados. **Exportar CSV** baixa os registros filtrados. **Salvar em PDF** abre a janela de impressão do navegador; nela, escolha a impressora **Salvar como PDF**.

Os registros financeiros antigos sem valor conhecido são mostrados como `—` e não entram na soma dos valores. Entradas e saídas são somadas separadamente; esses totais representam os valores informados nas movimentações, não um cálculo contábil automático.

## Verificar se o sistema está disponível

Com o servidor em execução, abra:

```text
http://127.0.0.1:3000/api/health
```

A resposta esperada é semelhante a:

```json
{"status":"ok","banco":"SQLite"}
```

Se `PORT` estiver configurado com outro valor, use essa porta no endereço. A própria interface também informa quando está conectada ao SQLite e apresenta uma ação para tentar carregar os dados novamente se houver falha.

## API local

A API usa JSON e é servida na mesma origem da interface. As rotas disponíveis são:

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/health` | Verifica a disponibilidade HTTP do sistema. |
| `GET` | `/api/products` | Lista todos os produtos em ordem alfabética. |
| `GET` | `/api/products/:id` | Consulta um produto. |
| `POST` | `/api/products` | Cadastra produto e, se houver saldo inicial, registra a entrada inicial. |
| `PUT` | `/api/products/:id` | Atualiza nome, categoria, fornecedor, preço e estoque mínimo. O saldo não é alterado por essa rota. |
| `GET` | `/api/movements` | Lista movimentações, mais recentes primeiro. |
| `POST` | `/api/movements` | Registra entrada ou saída e atualiza o saldo dentro de uma transação. |

`GET /api/movements` aceita os parâmetros opcionais `type` (`entrada` ou `saida`), `productId`, `from`, `to` (`AAAA-MM-DD`) e `q` (produto ou observação). Se a data inicial for posterior à final, ou algum filtro for inválido, a API responde com erro de validação.

Exemplos de corpos JSON:

```json
{
  "name": "Perfume demonstrativo",
  "category": "Perfumes",
  "supplier": "Fornecedor",
  "price": 89.9,
  "quantity": 5,
  "minimum": 2
}
```

```json
{
  "productId": 1,
  "type": "entrada",
  "quantity": 4,
  "totalValue": 200.5,
  "note": "Reposição"
}
```

Os campos monetários da API são enviados em reais com até duas casas decimais. O servidor valida os dados independentemente das validações do navegador. Quantidades precisam ser números inteiros positivos nas movimentações; valores financeiros não podem ser negativos. Saídas com saldo insuficiente respondem com HTTP `409`.

## Banco de dados e integridade

O esquema está em `server/schema.sql` e cria as tabelas `products` e `stock_movements`, além de índices para consultas. O `better-sqlite3` habilita chaves estrangeiras e modo WAL. O cadastro de produto com estoque inicial e cada movimentação são gravados em transações para manter saldo e histórico consistentes.

Valores são armazenados como inteiros em centavos (`price_cents` e `total_value_cents`), evitando erros comuns de precisão decimal. O valor total de uma movimentação não muda se o preço atual do produto for editado. A coluna `total_value_cents` aceita `NULL` para movimentos anteriores ou saldos iniciais cujo valor não foi informado.

Na inicialização, o sistema cria as tabelas ausentes e adiciona `total_value_cents` a bancos de versões anteriores sem apagar os registros de estoque. Também remove a antiga tabela `auth_sessions`, que continha sessões de autenticação de uma versão anterior; ela não armazena produtos nem movimentações.

### Backup e restauração

Não existe backup automático nesta versão. Para fazer uma cópia manual, pare o servidor com **Ctrl+C** e copie o arquivo SQLite configurado em `DATABASE_PATH` ou o arquivo padrão do perfil do usuário. Mantenha a cópia em um local seguro e fora do Git. Para restaurar, pare o servidor e substitua o banco pelo arquivo de backup correto. Não copie ou substitua o banco enquanto o servidor estiver aberto.

## Estrutura do projeto

```text
.
├── client/
│   ├── app.js                 # Navegação, carregamento de dados e eventos
│   ├── package.json            # Define os módulos do navegador como ES Modules
│   ├── components/            # Modal de produto e notificações
│   ├── data/                  # Estado em memória e categorias
│   ├── lib/                   # Cliente HTTP, ícones e utilitários visuais
│   └── screens/               # Painel, catálogo, movimentações e histórico
├── server/
│   ├── routes/                 # Endpoints de produtos e movimentações
│   ├── config.js               # Validação da porta
│   ├── database.js             # Abertura e inicialização do SQLite
│   ├── schema.sql              # Tabelas, restrições e índices
│   └── serializers.js          # Conversão dos registros para JSON
├── entrega-academica/          # Artigo, relatório e capturas da entrega
├── index.html                  # Documento principal da interface
├── styles.css                  # Layout, tipografia e responsividade
├── .env.example                # Modelo de configuração local
├── package.json                # Scripts e dependências
└── package-lock.json           # Versões travadas para instalação reproduzível
```

O servidor entrega a interface em `/`, os módulos do navegador em `/client`, a folha de estilos em `/styles.css` e os ícones Lucide instalados em `/vendor/lucide.js`. O front-end é dividido por telas e componentes, enquanto a API e o acesso ao banco ficam no servidor.

## Segurança e limites atuais

- **Sem login:** o sistema não autentica usuários. O uso local sem login é intencional nesta versão.
- **Acesso local:** o Express escuta apenas em `127.0.0.1`. Não altere o código para `0.0.0.0` nem encaminhe a porta do servidor para a rede ou internet.
- **Sem sincronização:** cada instalação usa seu próprio arquivo SQLite. Dados não são compartilhados entre computadores ou perfis do sistema operacional.
- **Sem exclusão de produto ou movimentação pela interface:** produtos podem ser cadastrados e editados; o histórico é preservado e não possui ação para editar ou remover movimentos.
- **Categorias fixas:** a lista atual é definida em `client/data/state.js`.
- **Histórico carregado no navegador:** a API e a interface carregam a lista completa de produtos e movimentações; não há paginação nesta versão. Os filtros e a exportação são aplicados aos dados carregados.
- **Sem backup automatizado ou suíte de testes configurada:** o repositório não define scripts `test`, `lint` ou `build` no `package.json`.

Se o sistema precisar ser acessado por mais de um computador, receber usuários diferentes ou ser publicado na internet, será necessário projetar uma implantação apropriada, com autenticação, autorização, proteção da API, backup e revisão de segurança. O servidor local atual não oferece esses recursos.

## Solução de problemas

### `Configure um PORT entre 1 e 65535`

Confira se `PORT` em `.env` contém apenas um número inteiro válido. Se a porta padrão `3000` estiver ocupada, escolha outra, salve o arquivo e reinicie o servidor. Depois, use a nova porta também no endereço do navegador.

### A tela informa que não conseguiu conectar ao servidor

Confirme que `npm run dev` ou `npm start` ainda está rodando no terminal. Acesse a mesma origem indicada no terminal, por exemplo `http://127.0.0.1:3000`, e consulte `/api/health`.

### Erro ao carregar `better-sqlite3`

Confirme que a versão do Node atende ao requisito e reinstale as dependências com `npm ci`. Se o npm informar que precisa compilar o módulo no Windows, instale as ferramentas de compilação C++ apropriadas e tente novamente.

### Banco não abre ou não pode ser gravado

Verifique se a pasta configurada em `DATABASE_PATH` existe e se o usuário tem permissão para gravar nela. Prefira o local padrão ou uma pasta local fora do OneDrive e de diretórios de rede. Feche outras instâncias que possam estar usando o mesmo arquivo SQLite.

### O sistema abriu sem produtos

Não há dados de demonstração. Cadastre os produtos reais da loja e confira os saldos antes de iniciar as movimentações.

## Materiais acadêmicos

Os documentos do artigo e do relatório, junto às capturas de tela correspondentes, ficam em `entrega-academica/`. Eles são materiais de entrega e não são necessários para iniciar a aplicação.
