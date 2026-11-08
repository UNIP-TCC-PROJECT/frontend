# Frontend — TCC

Aplicação **web** do projeto de TCC, feita em React + TypeScript com Vite.
É uma plataforma que conecta **ONGs** e **doadores**: as ONGs se cadastram e
ficam visíveis em uma listagem, e os doadores podem se cadastrar, buscar e
conhecer as ONGs.

> Observação: este é um projeto **web** — roda no navegador. **Não** é um app mobile,
> então **não** precisa de Expo, Android Studio nem de emulador/celular.

## Sumário

- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Como instalar e rodar](#instalação)
- [Scripts disponíveis](#scripts-disponíveis)
- [Estrutura do projeto](#estrutura-do-projeto)

## Tecnologias

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) — build e servidor de desenvolvimento
- [Tailwind CSS](https://tailwindcss.com/) — estilização
- [React Router](https://reactrouter.com/) — rotas (`/`, `/ongs`, `/auth`)
- [React Hook Form](https://react-hook-form.com/) — formulários
- [Axios](https://axios-http.com/) — comunicação com a API

## Pré-requisitos

Antes de começar, você precisa ter instalado na sua máquina:

- **[Node.js](https://nodejs.org/)** — versão **22.9.0** (instale exatamente essa versão)
- **[Yarn](https://yarnpkg.com/)** (gerenciador de pacotes usado neste projeto)
  ```bash
  npm install -g yarn
  ```
- **Git** para clonar o repositório

## Como instalar e rodar

1. Clone o repositório e entre na pasta do frontend:

   ```bash
   git clone <url-do-repositorio>
   cd UNIP-EXTENSION/frontend
   ```

2. Instale as dependências:

   ```bash
   yarn install
   ```

3. Inicie o servidor de desenvolvimento do Expo:
   ```bash
   yarn dev
   ```

O Vite vai mostrar no terminal o endereço local (normalmente
`http://localhost:5173`). Abra esse endereço no navegador.

### Backend / API

O frontend conversa com uma API em `http://localhost:3000`
(configurada em [`src/services/api.ts`](src/services/api.ts)).
Para as telas de cadastro, login e listagem de ONGs funcionarem por completo,
o backend precisa estar rodando nesse endereço.

## Scripts disponíveis

| Comando        | O que faz                                         |
| -------------- | ------------------------------------------------- |
| `yarn dev`     | Sobe o servidor de desenvolvimento com hot reload |
| `yarn build`   | Gera a build de produção em `dist/`               |
| `yarn preview` | Serve localmente a build de produção para testar  |
| `yarn lint`    | Roda o ESLint no projeto                          |

## Estrutura do projeto

```
src/
├── components/   # Componentes reutilizáveis (Button, Input, Header, Footer...)
├── context/      # Contextos React (ex.: AuthContext)
├── pages/        # Páginas/rotas (Home, Ongs, Auth)
├── services/     # Configuração da API (axios)
├── App.tsx       # Definição das rotas
└── main.tsx      # Ponto de entrada da aplicação
```
