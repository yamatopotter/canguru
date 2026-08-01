# Gerador de Impressos de Endereços

Sistema para selecionar rotas da Vuupt e imprimir etiquetas de endereço em impressora térmica (72mm), com login e área administrativa. O projeto original (HTML/CSS/JS puro, sem login) está arquivado em [`old/`](old/).

## Arquitetura

- **Frontend**: Vite + React + TypeScript (raiz do projeto).
- **Backend**: Node/Express + TypeScript + Prisma (SQLite) em [`server/`](server/).
- Autenticação por cookie httpOnly (não usa localStorage/token no navegador).
- O token da API da Vuupt fica só no backend (banco de dados), nunca é enviado ao navegador.

## Primeira vez rodando o projeto

Com Node 18+ instalado:

```bash
npm run setup
```

Isso instala as dependências do backend, cria o banco SQLite e roda o seed (usuário administrador inicial + configurações padrão). Depois:

```bash
npm install       # dependências do frontend
npm run dev       # sobe frontend (5173) e backend (3001) juntos
```

Acesse `http://localhost:5173`. As credenciais do administrador inicial estão em `server/.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) — troque a senha assim que entrar pela primeira vez, pela tela de Usuários.

Rodar frontend e backend separadamente, se preferir:

```bash
npm run dev:server   # backend em outro terminal
npm run dev:client   # frontend
```

## Configuração (`server/.env`)

Copie `server/.env.example` para `server/.env` e ajuste:

- `JWT_SECRET` — string aleatória longa (ex.: `openssl rand -hex 32`).
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — administrador criado pelo `npm run seed`.
- `ZOHO_CLIENT_ID` / `ZOHO_CLIENT_SECRET` — do app registrado em [api-console.zoho.com](https://api-console.zoho.com). O `ZOHO_REDIRECT_URI` do `.env` precisa ser cadastrado **exatamente igual** no console do Zoho.
- `VUUPT_API_TOKEN` — usado só como valor inicial do seed; depois disso, o token vira editável pela tela administrativa de Configurações.

Sem `ZOHO_CLIENT_ID`/`SECRET` configurados, o botão "Entrar com Zoho" simplesmente não aparece na tela de login — o login por e-mail/senha continua funcionando normalmente.

## Login com Zoho — como funciona

- Só é possível logar com Zoho se já existir um usuário cadastrado (por um administrador) com aquele e-mail. Não há autocadastro: isso evita que qualquer conta Zoho da organização entre no sistema sem ser explicitamente liberada.
- No primeiro login bem-sucedido, a conta local é vinculada automaticamente à conta Zoho pelo e-mail.
- Um administrador também pode criar o usuário já como "Zoho (OAuth)" na tela de Usuários, sem definir senha.

## Área administrativa

- **Usuários** (`/admin/users`): criar, editar, ativar/desativar e remover usuários; resetar senha. Sempre é necessário manter pelo menos um administrador ativo.
- **Configurações** (`/admin/settings`): nome da empresa, logo (aparece no cabeçalho e na tela de login) e token da API da Vuupt.

## Estrutura

```
src/                    frontend (Vite/React)
  api/                  chamadas HTTP para o backend
  auth/                 AuthContext + guards de rota
  components/           Layout, Button, LabelCard, etc.
  pages/                telas (login, impressos, admin)
server/
  src/                  Express (rotas, middlewares, serviços)
  prisma/               schema, migrations, seed
```

## Impressão térmica (72mm)

- `@page { size: 72mm auto; margin: 0 }` (em `src/index.css`) remove as margens padrão do navegador e ajusta a página ao rolo de 72mm.
- Cabeçalho da aplicação (logo, navegação, usuário) é ocultado na impressão — só a etiqueta vai para o papel.
- Cada etiqueta quebra em uma página própria, sem página em branco sobrando após a última.
- Bordas, sombras e cores de destaque somem no modo impressão — texto sai só em preto, já que impressora térmica não reproduz tons de cinza/cor.

## Identidade visual

Paleta baseada nas cores da empresa (preto, roxo, branco), em variáveis CSS (`src/index.css`). A logo enviada na tela de Configurações substitui a marca padrão no cabeçalho e na tela de login.
