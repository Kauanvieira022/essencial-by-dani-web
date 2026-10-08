# Essencial By Dani — protótipo web

Protótipo inicial das telas de gestão de estoque, baseado no escopo do projeto e nos fluxos do sistema desktop de referência.

## Como visualizar

Abra `index.html` em um navegador. O protótipo usa HTML, CSS e JavaScript sem frameworks; as fontes personalizadas carregam do Google Fonts com alternativas do sistema.

## Telas incluídas

- Visão geral com indicadores, alertas de estoque baixo e movimentações recentes.
- Catálogo com busca, filtro de estoque baixo e cadastro/edição de produtos.
- Registro de entradas e saídas com validação de quantidade e saldo disponível.
- Histórico de movimentações com busca e filtro por tipo.

## Limites desta etapa

Os dados são demonstrativos e ficam apenas na memória do navegador; recarregar a página restaura os exemplos. Ainda não há API, autenticação ou persistência no SQLite. Esta etapa prototipa a experiência das telas; a aplicação final seguirá a arquitetura prevista no documento do projeto, com servidor Node.js/Express e SQLite.

O cadastro inclui preço do produto, conforme o sistema de referência. O documento também menciona “valores” das movimentações, mas não esclarece se são monetários ou apenas quantidades. Por isso, as telas de entrada e saída mostram quantidade e observação; o significado de valores por movimentação fica pendente de definição.

Os exemplos de produtos e movimentações são fictícios. A paleta azul e rosa é provisória e deriva das cores usadas na janela principal do aplicativo de referência; não substitui um guia oficial de marca.
