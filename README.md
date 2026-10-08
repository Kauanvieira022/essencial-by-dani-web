# Essencial By Dani — sistema web de gestão de estoque

## O que é

O Essencial By Dani é um sistema web para organizar o estoque da loja. A proposta é reunir o catálogo de produtos, os saldos disponíveis, os alertas de reposição e o histórico de entradas e saídas em uma única interface.

O projeto está sendo desenvolvido com HTML, CSS e JavaScript no front-end, Node.js e Express no servidor e SQLite como banco de dados. O navegador não acessa o arquivo do banco diretamente: a comunicação será feita por uma API no servidor.

## Como usar o protótipo

### 1. Iniciar o sistema

É necessário ter Node.js 22 ou superior instalado. Na pasta do projeto, execute:

```sh
npm install
npm run dev
```

Abra `http://localhost:3000` no navegador. O servidor inicializa o esquema SQLite e disponibiliza a rota `GET /api/health`.

### 2. Consultar a visão geral

Na tela **Visão geral**, confira a quantidade de produtos e unidades, os itens que precisam de reposição, o saldo por categoria e as movimentações recentes. Use os botões **Registrar entrada** ou **Registrar saída** para iniciar uma movimentação diretamente.

### 3. Cadastrar e localizar produtos

Abra **Produtos** no menu lateral e selecione **Novo produto**. Informe o nome e, quando disponíveis, a categoria, o fornecedor, o preço, o estoque inicial e o limite mínimo. Para alterar um cadastro, use o botão de edição na linha do produto.

Na mesma tela, pesquise por nome, categoria ou fornecedor. Também é possível filtrar por categoria ou mostrar apenas produtos no mínimo ou abaixo dele.

### 4. Registrar uma entrada

Abra **Entrada de estoque**, escolha o produto, informe a quantidade recebida e, se quiser, adicione uma observação, como a reposição do fornecedor. Confirme a entrada para atualizar o saldo demonstrativo e incluir o registro no histórico.

### 5. Registrar uma saída

Abra **Saída de estoque**, escolha um produto que tenha saldo, informe a quantidade retirada e, opcionalmente, escreva uma observação. A quantidade não pode ultrapassar o saldo disponível. Confirme a saída para atualizar o saldo demonstrativo e registrar a movimentação.

### 6. Consultar movimentações

Abra **Movimentações** para consultar entradas e saídas. Use a busca para localizar registros por produto ou observação e o filtro para exibir apenas um tipo de movimentação. Os registros mais recentes aparecem primeiro.

O menu lateral permite alternar entre as telas; os botões voltar e avançar do navegador também acompanham a navegação.

> **Atenção:** o protótipo usa dados fictícios armazenados apenas na memória do navegador. As alterações feitas nas telas não são gravadas no SQLite e são perdidas ao recarregar a página. A integração com a API e a persistência ainda serão implementadas.

## Organização do projeto

- `client/data`: dados demonstrativos e rótulos das telas.
- `client/components`: componentes reutilizáveis, como o formulário de produto e os avisos.
- `client/lib`: formatação, ícones e elementos compartilhados da interface.
- `client/screens`: apresentação de cada tela.
- `client/app.js`: navegação e coordenação das ações e dos formulários.
- `server`: inicialização do Express, banco SQLite e esquema das tabelas.

O front-end usa módulos JavaScript nativos, sem framework ou etapa de compilação.

## Banco de dados e estado atual

O servidor cria as tabelas `products` e `stock_movements` na inicialização. O preço é armazenado em centavos para evitar imprecisão decimal, e as movimentações mantêm vínculo com o produto.

Por padrão, o arquivo SQLite fica fora do repositório, na pasta de dados local do usuário. A variável de ambiente `DATABASE_PATH` permite definir outro caminho. O banco e os arquivos auxiliares não devem ser versionados.

Embora o banco e o esquema estejam preparados, as telas ainda usam dados demonstrativos em memória. A API de produtos e movimentações, as regras de negócio no servidor e a integração da interface com o banco serão desenvolvidas nas próximas etapas.

## Padrões visuais

- **Ícones:** biblioteca Lucide, instalada como dependência local. Os ícones usam traço de 1,8 px e tamanhos definidos por contexto: 12, 16, 20 ou 24 px.
- **Tipografia:** DM Sans para a interface; Playfair Display para a marca e destaques.
- **Escala:** tamanhos de texto, espaçamentos, alturas de controles e raios de borda ficam centralizados como variáveis CSS em `styles.css`. A escala de espaçamento parte de 4 px.

## Decisões pendentes

O cadastro inclui o preço do produto, conforme o sistema de referência. O documento também menciona “valores” das movimentações, mas não esclarece se são valores monetários ou quantidades. Por isso, as telas de entrada e saída mostram quantidade e observação; o significado de valores por movimentação precisa ser definido antes da implementação dessa regra.

Os exemplos de produtos e movimentações são fictícios. A paleta azul e rosa é provisória e deriva das cores usadas na janela principal do aplicativo de referência; não substitui um guia oficial de marca.
