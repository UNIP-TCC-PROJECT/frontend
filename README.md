# Frontend — TCC

Aplicação **web** do projeto de TCC, feita em React + TypeScript com Vite.
É uma plataforma que conecta **ONGs** e **doadores**: as ONGs se cadastram e
ficam visíveis em uma listagem, e os doadores podem se cadastrar, buscar e
conhecer as ONGs.

> ℹ️ Este é um projeto **web** — roda no navegador. **Não** é um app mobile,
> então **não** precisa de Expo, Android Studio nem de emulador/celular.

## Tecnologias

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) — build e servidor de desenvolvimento
- [Tailwind CSS](https://tailwindcss.com/) — estilização
- [React Router](https://reactrouter.com/) — rotas (`/`, `/ongs`, `/auth`)
- [React Hook Form](https://react-hook-form.com/) — formulários
- [Axios](https://axios-http.com/) — comunicação com a API

## Pré-requisitos

- **Node.js 22.9.0** (versão exigida pelo projeto)
- **Yarn** (gerenciador de pacotes)

Para verificar se você tem o Node na versão certa:

```bash
node -v   # deve mostrar v22.9.0
```

Se não tiver o Node 22.9.0 instalado, baixe em
[nodejs.org](https://nodejs.org/) ou, de preferência, use um gerenciador de
versões para alternar facilmente entre versões:

```bash
# usando nvm (Linux/macOS) ou nvm-windows (Windows)
nvm install 22.9.0
nvm use 22.9.0
```

Caso não tenha o Yarn, instale com:

```bash
npm install -g yarn
```

## Instalação

Clone o repositório, entre na pasta `frontend` e instale as dependências:

```bash
yarn install
```

## Como rodar

Inicie o servidor de desenvolvimento:

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

| Comando        | O que faz                                            |
| -------------- | ---------------------------------------------------- |
| `yarn dev`     | Sobe o servidor de desenvolvimento com hot reload    |
| `yarn build`   | Gera a build de produção em `dist/`                  |
| `yarn preview` | Serve localmente a build de produção para testar     |
| `yarn lint`    | Roda o ESLint no projeto                             |

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
