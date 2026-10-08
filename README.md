# Essencial By Dani — sistema web de gestão de estoque

Repositório principal da aplicação web completa de gestão de estoque da Essencial By Dani. O desenvolvimento começa pela prototipação das telas e dos fluxos, e seguirá nesta mesma base até a implementação do sistema.

## Escopo do sistema

O sistema deverá permitir cadastrar, pesquisar e consultar produtos, registrar entradas e saídas, acompanhar saldos, sinalizar estoque mínimo e consultar o histórico de movimentações.

Arquitetura prevista no projeto: HTML, CSS e JavaScript no front-end; Node.js e Express no servidor; SQLite para persistência. A interface não acessará o arquivo do banco diretamente.

## Estado atual

A primeira etapa é a interface navegável com dados demonstrativos. Abra `index.html` em um navegador para visualizar as telas. O front-end usa HTML, CSS e JavaScript sem frameworks; as fontes personalizadas carregam do Google Fonts com alternativas do sistema.

## Telas e funcionalidades prototipadas

- Visão geral com indicadores, alertas de estoque baixo e movimentações recentes.
- Catálogo com busca, filtro de estoque baixo e cadastro/edição de produtos.
- Registro de entradas e saídas com validação de quantidade e saldo disponível.
- Histórico com busca e filtro por tipo de movimentação.

## Limites atuais e decisões pendentes

Os dados ainda são demonstrativos e ficam apenas na memória do navegador; recarregar a página restaura os exemplos. API, regras no servidor e persistência em SQLite ainda serão implementadas.

O cadastro inclui preço do produto, conforme o sistema de referência. O documento também menciona “valores” das movimentações, mas não esclarece se são monetários ou apenas quantidades. Por isso, as telas de entrada e saída mostram quantidade e observação; o significado de valores por movimentação fica pendente de definição.

Os exemplos de produtos e movimentações são fictícios. A paleta azul e rosa é provisória e deriva das cores usadas na janela principal do aplicativo de referência; não substitui um guia oficial de marca.
