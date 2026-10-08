# Essencial By Dani — sistema web de gestão de estoque

Repositório principal da aplicação web completa de gestão de estoque da Essencial By Dani. O desenvolvimento começa pela prototipação das telas e dos fluxos, e seguirá nesta mesma base até a implementação do sistema.

## Escopo do sistema

O sistema deverá permitir cadastrar, pesquisar e consultar produtos, registrar entradas e saídas, acompanhar saldos, sinalizar estoque mínimo e consultar o histórico de movimentações.

Arquitetura do projeto: HTML, CSS e JavaScript no front-end; Node.js e Express no servidor; SQLite para persistência. A interface não acessará o arquivo do banco diretamente.

## Executar localmente

Requer Node.js 22 ou superior.

```sh
npm install
npm run dev
```

Abra `http://localhost:3000`. O servidor Express também inicializa o banco e disponibiliza `GET /api/health`.

Por padrão, o arquivo SQLite fica fora do repositório, na pasta de dados local do usuário. A variável de ambiente `DATABASE_PATH` permite definir outro caminho. O banco e seus arquivos auxiliares não devem ser versionados.

## Estado atual

A base do servidor e o esquema inicial do banco estão preparados. As tabelas `products` e `stock_movements` são criadas automaticamente na inicialização; o preço do produto é armazenado em centavos para evitar imprecisão decimal, e as movimentações preservam o vínculo com o produto.

A interface ainda usa dados demonstrativos em memória. A API de produtos e movimentações e a integração das telas com o banco serão implementadas nas próximas etapas. O front-end usa HTML, CSS e JavaScript sem frameworks; as fontes personalizadas carregam do Google Fonts com alternativas do sistema.

## Padrões visuais

- **Ícones:** biblioteca Lucide, instalada como dependência local. Os ícones usam traço de 1,8 px e tamanhos definidos por contexto: 12, 16, 20 ou 24 px.
- **Tipografia:** DM Sans para a interface; Playfair Display fica restrita à marca e aos destaques.
- **Escala:** tamanhos de texto, espaçamentos, alturas de controles e raios de borda são centralizados como variáveis CSS em `styles.css`. A escala de espaçamento parte de 4 px.

## Telas e funcionalidades prototipadas

- Visão geral com indicadores, alertas de estoque baixo e movimentações recentes.
- Catálogo com busca, filtro de estoque baixo e cadastro/edição de produtos.
- Registro de entradas e saídas com validação de quantidade e saldo disponível.
- Histórico com busca e filtro por tipo de movimentação.

## Limites atuais e decisões pendentes

Os dados mostrados nas telas ainda são demonstrativos e ficam apenas na memória do navegador; recarregar a página restaura os exemplos. A API, as regras de negócio no servidor e a persistência conectada à interface ainda serão implementadas.

O cadastro inclui preço do produto, conforme o sistema de referência. O documento também menciona “valores” das movimentações, mas não esclarece se são monetários ou apenas quantidades. Por isso, as telas de entrada e saída mostram quantidade e observação; o significado de valores por movimentação fica pendente de definição.

Os exemplos de produtos e movimentações são fictícios. A paleta azul e rosa é provisória e deriva das cores usadas na janela principal do aplicativo de referência; não substitui um guia oficial de marca.
