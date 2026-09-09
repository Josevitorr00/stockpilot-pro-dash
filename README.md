# Commerce Companion

# StockPilot - Sistema de Gestão Comercial (Front-end)

Você é um Desenvolvedor Front-end Sênior especializado em React, TypeScript, UX/UI, Design Systems e Dashboards Administrativos.

Seu objetivo é desenvolver 100% do Front-end de um sistema profissional de gestão comercial chamado **StockPilot**, destinado a pequenos comércios.

IMPORTANTE:

- Desenvolver APENAS o Front-end.
- NÃO desenvolver backend.
- NÃO criar APIs.
- NÃO criar banco de dados.
- NÃO implementar autenticação real.
- NÃO utilizar JWT.
- NÃO utilizar Express.
- NÃO utilizar Node.js.
- NÃO utilizar SQLite.
- Utilizar apenas dados mock.
- Utilizar localStorage apenas para simular autenticação.
- Toda a estrutura deverá ficar preparada para integração futura com um backend em Node.js + Express + SQLite.

O projeto deve parecer um software comercial pronto para produção.

----------------------------------------

# Identidade do Sistema

Nome:

StockPilot

Slogan:

Controle Inteligente para o seu Comércio.

----------------------------------------

# Estilo Visual

A interface deve ser inspirada em:

- Stripe Dashboard
- Linear
- Notion
- Vercel Dashboard
- ERP modernos

Características:

- Premium
- Moderna
- Elegante
- Minimalista
- Limpa
- Profissional
- Fácil de usar
- Excelente UX

Evite qualquer aparência antiga.

----------------------------------------

# Paleta Oficial

Cor principal (Background)

#F2F2F2

Sidebar

#192618

Botões Principais

#1E401D

Hover

#4D8C30

Textos

#0D0D0D

Cards

Branco

Sombras suaves

Bordas discretas

Utilize bastante espaço em branco.

----------------------------------------

# Tipografia

Utilizar:

Inter

ou

Poppins

----------------------------------------

# Ícones

Lucide React

----------------------------------------

# Tecnologias

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router DOM
- Recharts
- Framer Motion

----------------------------------------

# Organização

Organizar o projeto da seguinte forma:

src/

components/

pages/

layouts/

hooks/

services/mock/

contexts/

types/

utils/

assets/

routes/

styles/

----------------------------------------

# Login Mock

Criar um sistema completo de autenticação simulada.

Criar:

- Login
- Cadastro
- Esqueci minha senha

Campos:

- Email
- Senha

Recursos:

- Mostrar senha
- Ocultar senha
- Lembrar-me
- Validação visual
- Loading
- Toasts
- Animações

Credenciais:

Email:

admin@comercio.com

Senha:

123456

Caso esteja correto:

Entrar no Dashboard.

Caso esteja errado:

Mostrar mensagem de erro.

Utilizar apenas localStorage.

Não utilizar backend.

----------------------------------------

# Layout

Criar:

Sidebar fixa

Navbar superior

Pesquisa

Notificações

Avatar

Perfil

Breadcrumb

Menu do usuário

Preparar estrutura para modo escuro.

----------------------------------------

# Menu Lateral

Dashboard

Produtos

Estoque

Vendas

Compras

Clientes

Fornecedores

Financeiro

Relatórios

Configurações

Perfil

Logout

----------------------------------------

# Dashboard

Criar um Dashboard extremamente profissional contendo:

Cards:

- Receita do Dia
- Receita do Mês
- Lucro Mensal
- Fluxo de Caixa
- Produtos
- Estoque Baixo
- Clientes
- Fornecedores
- Total de Vendas

Gráficos:

- Linha (Faturamento Mensal)
- Barras (Produtos Mais Vendidos)
- Pizza (Categorias)
- Área (Lucro)

Tabela:

Últimas Vendas

Tabela:

Produtos com Estoque Baixo

Utilizar apenas dados simulados.

----------------------------------------

# Produtos

Criar:

Tabela moderna

Cadastro

Editar

Excluir

Pesquisar

Filtros

Paginação

Modal Cadastro

Modal Editar

Modal Excluir

Campos:

Imagem

Nome

Categoria

Código

Preço Compra

Preço Venda

Lucro

Quantidade

Fornecedor

Status

----------------------------------------

# Estoque

Criar:

Entradas

Saídas

Histórico

Movimentações

Alerta de Estoque Baixo

----------------------------------------

# Vendas

Criar:

Nova Venda

Lista

Pesquisa

Filtros

Cliente

Produto

Quantidade

Valor

Forma de Pagamento

Status

Data

----------------------------------------

# Compras

Criar:

Nova Compra

Fornecedor

Produto

Quantidade

Valor

Status

Data

----------------------------------------

# Clientes

Criar:

Cadastro

Editar

Excluir

Pesquisar

Histórico

----------------------------------------

# Fornecedores

Criar:

Cadastro

Editar

Excluir

Pesquisar

Cidade

Telefone

Email

Produtos

----------------------------------------

# Financeiro

Criar:

Receitas

Despesas

Fluxo de Caixa

Saldo

Lucro

Cards

Gráficos

Tabela Financeira

----------------------------------------

# Relatórios

Criar:

Financeiro

Produtos

Clientes

Estoque

Vendas

Filtros

Botão Exportar PDF (Mock)

Botão Exportar Excel (Mock)

----------------------------------------

# Configurações

Criar:

Logo

Nome da Empresa

Telefone

Email

Endereço

Idioma

Tema

Backup (Mock)

----------------------------------------

# Perfil

Criar:

Foto

Nome

Email

Alterar Senha (Mock)

Preferências

----------------------------------------

# Notificações

Criar:

Centro de notificações

Alertas

Badges

Toasts

----------------------------------------

# Componentes

Criar componentes reutilizáveis:

Button

Input

Card

Table

Modal

Dropdown

Checkbox

Switch

Tooltip

Toast

Loading

Skeleton

Avatar

Badge

SearchBar

Pagination

Breadcrumb

Alert

----------------------------------------

# Responsividade

Desktop

Notebook

Tablet

Mobile

Todo o sistema deve ser totalmente responsivo.

----------------------------------------

# UX

Criar:

Animações suaves

Hover elegante

Feedback visual

Transições modernas

Excelente acessibilidade

Espaçamento consistente

Layout premium

----------------------------------------

# Código

Todo o código deve seguir boas práticas:

- Componentizado
- Escalável
- Reutilizável
- Tipado com TypeScript
- Organizado
- Fácil manutenção

----------------------------------------

# Extras

Criar também:

- Página 404
- Loading Inicial
- Skeleton Loading
- Pesquisa Global
- Dashboard totalmente navegável
- Dados simulados realistas

----------------------------------------

# IMPORTANTE

Quero desenvolver este sistema em etapas.

NÃO tente criar tudo em uma única resposta.

Divida o projeto em módulos completos.

A cada etapa entregue um módulo totalmente funcional antes de seguir para o próximo.

Ordem das etapas:

1. Estrutura do projeto + Login + Autenticação Mock
2. Layout Principal (Sidebar, Navbar e Rotas)
3. Dashboard
4. Produtos
5. Estoque
6. Vendas
7. Compras
8. Clientes
9. Fornecedores
10. Financeiro
11. Relatórios
12. Configurações
13. Perfil
14. Notificações
15. Polimento Final (Responsividade, animações, UX e otimizações)

Ao finalizar cada etapa, aguarde minha confirmação para continuar para a próxima.

O objetivo é que, ao final de todas as etapas, o StockPilot tenha aparência de um ERP moderno, profissional e pronto para ser integrado posteriormente a um backend desenvolvido em Node.js + Express + SQLite.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d7af022f-36b6-4bb7-ac5e-2555e9e53886).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
