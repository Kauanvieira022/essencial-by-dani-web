# Essencial By Dani - sistema web de gestão de estoque

## Sobre o projeto

Aplicação web para organizar o catálogo de produtos da Essencial By Dani, acompanhar saldos, sinalizar itens no estoque mínimo e registrar entradas e saídas. A interface usa HTML, CSS e JavaScript; o servidor usa Node.js e Express; os dados são persistidos em SQLite. O navegador conversa com o servidor por uma API e não acessa o arquivo SQLite diretamente.

O sistema foi preparado para uso local, sem tela de login, e o servidor escuta somente em `127.0.0.1`. Ele não fica disponível para outros dispositivos da rede. Não altere esse endereço nem exponha a API publicamente sem implementar autenticação.

## Requisitos

- Node.js 22 ou superior.
- npm.

## Configuração e inicialização

1. No terminal, acesse a pasta do projeto.
2. Instale as dependências:

   ```sh
   npm install
   ```

3. Opcionalmente, copie o arquivo de exemplo de ambiente:

   ```powershell
   Copy-Item .env.example .env
   ```

   As variáveis disponíveis são `PORT` (padrão `3000`) e `DATABASE_PATH` (caminho opcional para o arquivo SQLite). Sem `DATABASE_PATH`, o banco fica na pasta local de dados do usuário, fora do repositório. O arquivo `.env` é ignorado pelo Git.

4. Inicie o servidor em modo de desenvolvimento:

   ```sh
   npm run dev
   ```

5. Abra `http://127.0.0.1:3000`. Para confirmar a conexão com o servidor e o SQLite, acesse `http://127.0.0.1:3000/api/health`.

O servidor cria as tabelas automaticamente na primeira execução. O banco começa sem produtos nem movimentações de exemplo.

## Fluxo de utilização

### 1. Visão geral

A tela inicial resume produtos cadastrados, unidades em estoque, itens que precisam de reposição e movimentações. Também apresenta saldo por categoria, produtos próximos do mínimo, histórico recente e atalhos para registrar entradas e saídas.

### 2. Produtos

No menu lateral, abra **Produtos** e escolha **Novo produto**. Informe nome, categoria e estoque mínimo; fornecedor e preço são opcionais. O estoque inicial pode ser informado no cadastro e, quando positivo, também fica registrado como entrada inicial. Para alterar os dados, use a ação de edição do produto.

A busca localiza produtos por nome, categoria ou fornecedor. Os filtros permitem selecionar uma categoria ou exibir apenas itens no mínimo ou abaixo dele.

### 3. Entrada de estoque

Abra **Entrada de estoque**, selecione um produto, informe a quantidade recebida e o valor total pago pela reposição. Se necessário, escreva uma observação. O valor fica registrado na própria movimentação em centavos, sem depender do preço atual do produto. Ao confirmar, o saldo é atualizado e a operação aparece no histórico.

### 4. Saída de estoque

Abra **Saída de estoque**, escolha um produto com saldo e informe a quantidade retirada e o valor total recebido. Para uma saída sem valor financeiro, informe R$ 0,00. O sistema rejeita quantidade maior que a disponível, evitando saldo negativo. A operação confirmada atualiza o saldo e entra no histórico.

### 5. Movimentações

Na tela **Movimentações**, consulte as entradas e saídas, quantidades e valores em ordem cronológica. A busca considera o nome do produto e a observação; os filtros podem limitar por tipo, produto e período. **Exportar CSV** baixa os registros que correspondem aos filtros ativos. **Salvar em PDF** abre a impressão do navegador, onde é possível selecionar a opção de salvar como PDF.

O menu lateral e os botões de voltar/avançar do navegador permitem alternar entre as telas. Os dados continuam disponíveis após recarregar a página, pois são armazenados no SQLite.

## Organização do projeto

- `client/data`: estado carregado pela API, categorias e rótulos das telas.
- `client/lib/api.js`: chamadas HTTP do navegador.
- `client/components`: componentes reutilizáveis, como formulário de produto e avisos.
- `client/lib`: formatação, ícones e elementos compartilhados da interface.
- `client/screens`: apresentação do painel, catálogo, movimentações e consultas.
- `client/app.js`: navegação e coordenação dos formulários.
- `server/routes`: rotas de produtos e movimentações.
- `server/database.js` e `server/schema.sql`: conexão e estrutura do SQLite.
- `server/serializers.js`: conversão dos registros do banco para as respostas da API.

O front-end usa módulos JavaScript nativos, sem framework ou etapa de compilação. Os ícones são da biblioteca Lucide; a tipografia principal é DM Sans, com alternativas sem serifa definidas no CSS.

## Banco de dados e funcionamento

O esquema cria as tabelas `products` e `stock_movements`, com índices para busca e ordenação. O preço do produto e o valor total próprio de cada movimentação são guardados em centavos para evitar imprecisão decimal. O valor histórico não muda quando o preço atual do produto é editado. Movimentações antigas e entradas de saldo inicial sem valor conhecido permanecem sem valor financeiro; os totais e exportações as identificam em branco. Cada movimentação referencia um produto existente. A inclusão do produto, o ajuste de saldo e o registro de movimento usam transações para manter os dados consistentes. Na primeira inicialização após esta atualização, a coluna de valor é adicionada automaticamente sem apagar os registros existentes.

Por padrão, o arquivo SQLite e seus arquivos auxiliares ficam fora do repositório. `DATABASE_PATH` permite escolher outro destino; bancos, credenciais e cópias de segurança não devem ser versionados.

## Escopo atual e próximos ajustes

As telas principais, a integração entre navegador, API Express e SQLite, os valores por movimentação e as exportações CSV e PDF estão implementados. As próximas etapas são validar o fluxo e o significado dos valores com a proprietária, cadastrar e conferir o estoque real, definir e praticar backup e restauração do banco e criar testes automatizados. A configuração atual é local e sem login; qualquer acesso por rede ou publicação externa exigirá autenticação e revisão da implantação.
