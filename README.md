# Canguru — Gerador de Impressos de Endereços (Evora Farma)

Sistema interno para selecionar rotas de entrega cadastradas na [Vuupt](https://vuupt.com) e
gerar/imprimir etiquetas de endereço em impressora térmica (72mm), uma por pacote, prontas pro
motoboy. Feito com Next.js 16 (App Router), Prisma + SQLite e componentes shadcn/ui.

**[Ver demonstração](https://matheuspbarreto.github.io/canguru/)** — página estática em
[`docs/index.html`](docs/index.html), publicada via GitHub Pages.

Versões anteriores ficam arquivadas em [`old/`](old/) — [`v1-vanilla`](old/v1-vanilla/)
(HTML/CSS/JS puro) e [`v2-vite-express`](old/v2-vite-express/) (Vite + React + Express) — só como
histórico, fora do build atual.

## Sumário

- [O que o sistema faz](#o-que-o-sistema-faz)
- [Stack](#stack)
- [Rodando com Docker (recomendado)](#rodando-com-docker-recomendado)
- [Deploy em servidor Ubuntu](#deploy-em-servidor-ubuntu)
- [Rodando em desenvolvimento (sem Docker)](#rodando-em-desenvolvimento-sem-docker)
- [Variáveis de ambiente vs. Configurações no banco](#variáveis-de-ambiente-vs-configurações-no-banco)
- [Primeiro acesso](#primeiro-acesso)
- [Tela administrativa](#tela-administrativa)
- [Usuários, papéis e login via Zoho](#usuários-papéis-e-login-via-zoho)
- [Backups do banco](#backups-do-banco)
- [Testes](#testes)
- [Scripts disponíveis](#scripts-disponíveis)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Página de demonstração (GitHub Pages)](#página-de-demonstração-github-pages)
- [Impressão térmica (72mm)](#impressão-térmica-72mm)
- [Solução de problemas comuns](#solução-de-problemas-comuns)

## O que o sistema faz

1. Um operador loga no sistema (usuário/senha ou, se habilitado, login via Zoho).
2. A tela inicial busca na API da Vuupt as rotas criadas nos últimos dias e mostra a mais recente
   por padrão — dá pra trocar de rota num combobox com busca (trocar de rota sempre volta a
   seleção de etiquetas pro padrão "todas marcadas").
3. Pra rota escolhida, o sistema busca os endereços (serviços) e monta um cartão de etiqueta por
   endereço: pedido, nome do cliente, telefone, endereço completo, logo da empresa e, se
   habilitado nas Configurações, os campos "Pago" / "A Pagar" — clicáveis na tela (marcar um
   desmarca o outro) e com campo pra digitar o valor a pagar, que sai em negrito na etiqueta.
4. O botão "Imprimir Etiquetas" fica no topo da tela, junto com "Selecionar todas". O operador
   marca/desmarca quais etiquetas quer imprimir (todas vêm marcadas por padrão) e imprime. O CSS
   de impressão é otimizado pra bobina de 72mm: uma etiqueta por página, margens configuráveis
   (veja [Impressão térmica](#impressão-térmica-72mm)), sem página em branco sobrando.

### Funcionalidades administrativas

- **Usuários**: criar, editar, ativar/desativar, remover; papel Admin/Operador; senha opcional
  (pode ser só-Zoho); forçar troca de senha no próximo login; encerrar sessões ativas remotamente.
- **Configurações** (tudo salvo no banco, editável sem redeploy):
  - Nome e logo da empresa (aparece no cabeçalho, na tela de login e nas etiquetas impressas).
  - Token da API da Vuupt, com aviso de expiração e teste de conexão.
  - **Etiqueta impressa**: mostrar ou não os campos "Pago"/"A Pagar", e as margens
    superior/inferior (mm) de cada etiqueta — com uma pré-visualização ao vivo que atualiza
    conforme os valores mudam, antes mesmo de salvar.
  - Servidor SMTP (envio de e-mail de recuperação de senha), com teste de conexão.
  - Login via Zoho OAuth (Client ID/Secret, Redirect URI, Accounts Base URL).
- **Auditoria**: log unificado de atividade (login, alterações de usuário, configurações,
  impressões) na tela Admin → Atividade, com filtro por tipo de ação e paginação.
- **Segurança**: rate limiting em login e recuperação de senha; sessões JWT revogáveis
  remotamente; senha nunca fica em texto puro; recuperação de senha por e-mail com link único e
  de uso único (fallback pra `tecnologia@evorafarma.com.br` se o usuário não tiver e-mail).
- **Backup automático** do banco SQLite (diário em produção + script manual).
- **Tema claro/escuro**, com o layout de impressão sempre forçado a claro (preto sobre branco),
  independente do tema escolhido na tela.
- **Interface responsiva**: em telas estreitas, a navegação e as ações de conta (tema, trocar
  senha, sobre, sair) ficam num menu de gaveta acessível pelo ícone de menu no cabeçalho.
- **"Sobre"**: modal acessível de qualquer tela (cabeçalho ou menu mobile) com versão instalada,
  desenvolvedor, link do repositório e imagem Docker usada.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions)
- [React 19](https://react.dev) + TypeScript
- [Prisma 5](https://www.prisma.io) + SQLite (`prisma/dev.db`)
- [shadcn/ui](https://ui.shadcn.com) (preset "base-nova", sobre [Base UI](https://base-ui.com)) +
  Tailwind CSS v4
- `jose` (JWT), `bcryptjs` (hash de senha), `nodemailer` (SMTP), `sonner` (toasts), `next-themes`
  (tema claro/escuro)
- [Vitest](https://vitest.dev) para testes de integração

Autenticação por cookie httpOnly com JWT assinado via `jose`. O token da API da Vuupt e as
credenciais do Zoho/SMTP ficam só no banco — nunca são enviados ao navegador. Um único processo
Node serve tudo (sem proxy de dev, sem CORS, sem backend separado).

## Rodando com Docker (recomendado)

A imagem oficial está publicada em
**[matheuspbarreto/canguru](https://hub.docker.com/r/matheuspbarreto/canguru)**.

### Com docker compose

```bash
# 1. Copie o exemplo de variáveis de ambiente e preencha
cp .env.docker.example .env

# Gere um JWT_SECRET forte:
openssl rand -hex 32

# 2. Suba o container (baixa a imagem publicada e sobe com volumes persistentes)
docker compose up -d

# 3. Acompanhe os logs (migrations rodam automaticamente — o admin padrão
#    já é criado por elas, sem precisar de variável de ambiente nenhuma)
docker compose logs -f
```

O `docker-compose.yml` já usa a imagem publicada (`matheuspbarreto/canguru:latest`) e
cria três volumes nomeados persistentes:

| Volume           | Conteúdo                                            |
| ----------------- | ---------------------------------------------------- |
| `vuupt-data`       | Banco SQLite (`dev.db`)                              |
| `vuupt-uploads`     | Logo da empresa enviada pela tela de Configurações    |
| `vuupt-backups`     | Backups diários automáticos do banco                  |

Acesse em **http://localhost:3000** (ou a porta que você mapear).

Se preferir buildar a imagem localmente em vez de baixar a publicada, rode
`docker build -t matheuspbarreto/canguru:latest .` antes do `up` — o compose usa a
imagem já existente localmente com esse nome em vez de baixar (ou troque `image`/`build` no
`docker-compose.yml`, já vem comentado como alternativa).

### Com docker run (sem compose)

```bash
docker volume create vuupt-data
docker volume create vuupt-uploads
docker volume create vuupt-backups

docker run -d \
  --name vuupt-impressos \
  -p 3000:3000 \
  -e JWT_SECRET="$(openssl rand -hex 32)" \
  -e DATABASE_URL="file:/app/data/dev.db" \
  -e APP_BASE_URL="http://localhost:3000" \
  -e COOKIE_SECURE=false \
  -v vuupt-data:/app/data \
  -v vuupt-uploads:/app/uploads \
  -v vuupt-backups:/app/backups \
  matheuspbarreto/canguru:latest
```

O usuário administrador padrão (`admin` / `admin`) já vem criado pelas migrations — não precisa
de nenhuma variável de ambiente pra isso (veja [Primeiro acesso](#primeiro-acesso)).

### Buildando a imagem você mesmo

```bash
docker build -t matheuspbarreto/canguru:latest .
```

O `Dockerfile` é multi-stage (`deps` → `builder` → `runner`), usa o output `standalone` do
Next.js e já inclui `openssl` e o `binaryTarget` do Prisma certos pra rodar em `node:20-slim`
(Debian). O `docker-entrypoint.sh` roda `prisma migrate deploy` (que cria o admin padrão, se
ainda não existir) e o seed dos valores default de Configurações antes de iniciar o servidor.

## Deploy em servidor Ubuntu

Passo a passo completo pra colocar o sistema no ar num servidor Ubuntu limpo (22.04/24.04 LTS),
usando Docker + a imagem publicada. Você só precisa de dois arquivos no servidor —
`docker-compose.yml` e `.env` — não precisa clonar o repositório inteiro.

### 1. Instalar o Docker

```bash
sudo apt update && sudo apt upgrade -y

# Dependências e chave GPG oficial do Docker
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Repositório oficial do Docker pra sua versão do Ubuntu
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Roda "docker" sem sudo (precisa sair e logar de novo pra valer)
sudo usermod -aG docker $USER
```

O instalador oficial já habilita e inicia o serviço do Docker no boot (`docker.service`); não
precisa configurar nada a mais pra isso.

### 2. Copiar os arquivos de configuração pro servidor

Do seu computador, envie os dois arquivos (não precisa do resto do repositório):

```bash
scp docker-compose.yml .env.docker.example usuario@seu-servidor:/home/usuario/vuupt-impressos/
```

No servidor:

```bash
cd ~/vuupt-impressos
cp .env.docker.example .env
nano .env   # ou vim/vi
```

Preencha pelo menos:

- `JWT_SECRET` — gere com `openssl rand -hex 32`
- `APP_BASE_URL` — o domínio real, com `https://` (ex.: `https://impressos.evorafarma.com.br`)
- `COOKIE_SECURE=true` — obrigatório em produção, já que o servidor vai ficar atrás de HTTPS

### 3. Restringir a porta 3000 ao localhost

Como o próximo passo coloca um proxy reverso (nginx) na frente, edite `docker-compose.yml` e
troque a linha da porta pra só expor no localhost — assim a porta 3000 nunca fica acessível
direto de fora, só através do nginx:

```yaml
ports:
  - "127.0.0.1:3000:3000"
```

### 4. Subir o container

```bash
docker compose up -d
docker compose logs -f
```

Confirme que carrega em `http://127.0.0.1:3000` (de dentro do próprio servidor):

```bash
curl -I http://127.0.0.1:3000/login
```

### 5. Proxy reverso (nginx) + HTTPS com Let's Encrypt

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Crie `/etc/nginx/sites-available/vuupt-impressos`:

```nginx
server {
    listen 80;
    server_name impressos.evorafarma.com.br;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ative o site e emita o certificado (o certbot ajusta o arquivo automaticamente pra HTTPS):

```bash
sudo ln -s /etc/nginx/sites-available/vuupt-impressos /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d impressos.evorafarma.com.br
```

O certbot já configura a renovação automática (via timer do systemd, `certbot.timer`).

### 6. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80,443/tcp
sudo ufw enable
```

Não é necessário liberar a porta 3000 — com o passo 3, ela só responde em `127.0.0.1`, então o
`ufw` nem chega a entrar em jogo pra ela.

### 7. Primeiro acesso e atualizações

- Acesse `https://seu-dominio` e siga o [Primeiro acesso](#primeiro-acesso) normalmente.
- Pra atualizar pra uma versão nova da imagem, no servidor:
  ```bash
  cd ~/vuupt-impressos
  docker compose pull
  docker compose up -d
  ```
  Isso reaplica migrations automaticamente (via `docker-entrypoint.sh`) sem perder dados — o
  banco, os uploads e os backups ficam nos volumes nomeados (`vuupt-data`, `vuupt-uploads`,
  `vuupt-backups`), fora do ciclo de vida do container.

### 8. Backup fora do servidor (opcional, recomendado)

O sistema já faz backup automático do banco dentro do volume `vuupt-backups` (veja
[Backups do banco](#backups-do-banco)). Isso protege contra corrupção do banco, mas não contra
perda do servidor inteiro — vale copiar esse volume pra fora periodicamente (ex.: num cron job):

```bash
docker run --rm \
  -v vuupt-backups:/from \
  -v /home/usuario/backups-externos:/to \
  alpine sh -c "cp -a /from/. /to/"
```

## Rodando em desenvolvimento (sem Docker)

Requer Node.js 20+.

```bash
npm install
cp .env.example .env
# edite o .env: pelo menos JWT_SECRET é obrigatório

npm run prisma:migrate   # cria/atualiza prisma/dev.db (já cria o admin padrão, admin/admin)
npm run seed              # valores default de Configurações (idempotente)
npm run dev                # http://localhost:3000
```

Ou tudo de uma vez: `npm run setup` (install + migrate + seed).

## Variáveis de ambiente vs. Configurações no banco

O `.env` só guarda o que é **infraestrutura** — o que o processo precisa antes mesmo de acessar o
banco, ou que descreve o ambiente de deploy:

| Variável           | Obrigatória | Descrição                                                                             |
| ------------------- | :---------: | --------------------------------------------------------------------------------------- |
| `DATABASE_URL`        | sim         | Caminho do arquivo SQLite (`file:./dev.db` local, `file:/app/data/dev.db` no Docker)     |
| `JWT_SECRET`           | sim         | Chave de assinatura das sessões. Gere com `openssl rand -hex 32`                        |
| `APP_BASE_URL`         | não          | Usada para montar o link de redefinição de senha e o redirecionamento final do login via Zoho |
| `COOKIE_SECURE`        | não          | `true` em produção atrás de HTTPS; `false` em desenvolvimento local                     |

O usuário administrador inicial **não** é configurado por variável de ambiente — ele já vem
criado direto pela migration `seed_default_admin` (login `admin`, senha `admin`, com troca de
senha obrigatória no primeiro login). Isso garante que ele sempre existe, mesmo em ambientes que
nunca rodam `npm run seed` manualmente (ex.: só `prisma migrate deploy` no Docker).

**Tudo o mais é configuração de negócio e fica salvo no banco** (tabela `Setting`), editável pela
tela **Admin → Configurações**, sem precisar redeploy nem reiniciar o container:

- Nome e logo da empresa
- Token da API da Vuupt
- Servidor SMTP (host, porta, usuário, senha, remetente, TLS)
- Login via Zoho (Client ID, Client Secret, Redirect URI, Accounts Base URL)

Isso significa que credenciais como as do Zoho, o token da Vuupt e a senha do SMTP **nunca
precisam ir pro `.env`** — cadastre tudo direto na tela de Configurações depois do primeiro
login como administrador.

## Primeiro acesso

1. Entre com `admin` / `admin` — esse usuário já vem criado pelas migrations, em qualquer forma
   de instalação (local, Docker, etc.), sem precisar configurar nada. O sistema **força a troca
   dessa senha** logo no primeiro login.
2. Vá em **Configurações** e preencha:
   - Nome e logo da empresa.
   - Token da API da Vuupt.
   - Servidor SMTP, se quiser habilitar recuperação de senha por e-mail.
   - Zoho OAuth, se quiser permitir login via Zoho pra algum usuário.
3. Vá em **Usuários** e cadastre os operadores que vão usar o sistema no dia a dia. Se quiser dar
   um e-mail ao admin padrão (pra recuperação de senha ou login via Zoho), edite o cadastro dele
   ali também.

## Tela administrativa

| Página                | O que faz                                                                  |
| ---------------------- | ---------------------------------------------------------------------------- |
| Admin → Usuários         | CRUD de usuários, papel, ativar/desativar, encerrar sessões                  |
| Admin → Configurações      | Empresa/logo, token Vuupt (+ teste de conexão), etiqueta impressa (campos pago/a pagar + margens, com preview), SMTP (+ teste), Zoho OAuth |
| Admin → Atividade          | Log de auditoria: logins, alterações administrativas, impressões — com filtro por ação e paginação |

Todas as ações administrativas (criar/editar/remover usuário, mudar configuração, resetar senha)
ficam registradas na Atividade, com quem fez, quando e o quê.

## Usuários, papéis e login via Zoho

- **Papéis**: `ADMIN` (acesso total, inclusive à área administrativa) e `OPERATOR` (só a tela de
  seleção de rotas/impressão).
- **Proteções de conta**, validadas no servidor (não só escondendo botão na interface):
  - Um administrador não pode remover a própria conta.
  - Só é possível remover ou desativar um administrador se houver **mais de um** administrador
    ativo no sistema — sempre sobra pelo menos um.
- **Login**: usuário (obrigatório) + senha (opcional — pode ser só-Zoho) e/ou Zoho OAuth
  (opcional, precisa estar habilitado *por usuário*, não só configurado globalmente).
- **E-mail**: opcional. Só é necessário se o usuário for usar recuperação de senha por e-mail ou
  login via Zoho (o vínculo com a conta Zoho é feito por e-mail).
- **Login via Zoho** exige duas coisas ao mesmo tempo: (1) as credenciais do app Zoho
  configuradas em Admin → Configurações, e (2) o toggle "Login via Zoho" marcado no cadastro do
  usuário específico — isso evita que qualquer pessoa da organização Zoho consiga entrar só por
  ter conta na Zoho. Sem Zoho configurado, o botão "Entrar com Zoho" simplesmente não aparece na
  tela de login — o login por usuário/senha continua funcionando normalmente.
- **Recuperação de senha**: link único, expira em 1 hora, uso único. Se o usuário não tiver
  e-mail cadastrado, um alerta é enviado para `tecnologia@evorafarma.com.br` em vez de falhar
  silenciosamente.

## Backups do banco

- Em produção (`NODE_ENV=production`), o processo roda um backup automático assim que sobe e
  depois a cada 24h (`src/instrumentation.ts`), mantendo os 14 mais recentes em `backups/`.
- Manualmente: `npm run backup` (local) ou o volume `vuupt-backups` montado no Docker.
- O caminho do banco copiado é resolvido a partir de `DATABASE_URL`, então funciona tanto local
  (`prisma/dev.db`) quanto no container (`/app/data/dev.db`).

## Testes

```bash
npm test
```

Roda `prisma migrate deploy` num banco SQLite isolado (`prisma/test.db`, recriado do zero a cada
execução) e depois a suíte de testes de integração (Vitest): sessão JWT, hash de senha, rate
limiting, log de atividade, status do token da Vuupt e rotação de backups.

## Scripts disponíveis

| Script                  | Descrição                                    |
| ------------------------- | ----------------------------------------------- |
| `npm run dev`               | Servidor de desenvolvimento                    |
| `npm run build`              | Build de produção                              |
| `npm run start`              | Sobe o build de produção (`next start`)         |
| `npm run lint`                | ESLint                                         |
| `npm test`                     | Testes de integração (Vitest)                   |
| `npm run prisma:migrate`        | Aplica/cria migrations em desenvolvimento (inclui a criação do admin padrão) |
| `npm run seed`                  | Valores default de Configurações (idempotente)   |
| `npm run setup`                 | `install` + `prisma:migrate` + `seed`            |
| `npm run backup`                 | Backup manual do banco SQLite                    |

## Estrutura do projeto

```
src/
  app/
    (protected)/         Área logada: seleção de rota, etiquetas, admin/*
    login, forgot-password, reset-password, change-password
    api/auth/zoho/        Rotas do fluxo OAuth do Zoho
  components/            Componentes compartilhados (Header, LabelCard, ui/*)
  lib/                   Regras de negócio: auth, vuupt, settings, mailer, activity, backup...
  test/                  Testes de integração (Vitest)
prisma/
  schema.prisma           Modelo de dados (User, ActivityLog, PasswordResetToken, Setting)
  migrations/              Migrations aplicadas (inclui a criação do admin padrão, admin/admin)
  seed.ts                  Valores default de Setting (não cria mais o admin — isso é a migration)
scripts/
  backup-db.ts             CLI de backup manual
  test-db-setup.ts         Recria o banco de testes antes do Vitest
old/                       Versões anteriores do projeto (arquivadas, fora do build)
docs/                      Página de demonstração estática (GitHub Pages), fora do build do Next
Dockerfile, docker-compose.yml, docker-entrypoint.sh
```

## Página de demonstração (GitHub Pages)

[`docs/index.html`](docs/index.html) é uma página estática (HTML/CSS/JS puro, sem build)
mostrando o que o sistema faz, seguindo a mesma paleta e tipografia do produto — inclusive com
alternância de tema claro/escuro. Não faz parte do app Next.js; é só material de apresentação,
sem dados reais (os exemplos de pedido/cliente são fictícios).

Pra publicar em `https://matheuspbarreto.github.io/canguru/`: nas configurações do repositório no
GitHub, em **Settings → Pages**, defina "Deploy from a branch", branch `main` (ou a branch
padrão) e pasta `/docs`.

## Impressão térmica (72mm)

- `@page { size: 72mm auto; margin: 0 }` (em `src/app/globals.css`) remove as margens padrão do
  navegador e ajusta a página ao rolo de 72mm.
- A etiqueta em si é impressa com **70mm** de largura (não os 72mm cheios), centralizada — sobra
  uma margem de segurança de 1mm de cada lado. Impressoras térmicas de "72mm" raramente imprimem
  de ponta a ponta, e essa folga evita corte de conteúdo nas bordas mesmo quando o driver da
  impressora não reporta a área realmente imprimível.
- Margem **superior/inferior** de cada etiqueta é configurável em Admin → Configurações (em mm,
  com pré-visualização ao vivo) — a lateral fica fixa por ser a proteção contra corte acima.
- Logo da empresa no canto superior direito da etiqueta, na mesma linha do número do pedido —
  evita gastar uma linha inteira só com a logo, sobrando mais papel pro conteúdo que o motoboy
  precisa ler (nome do cliente, endereço, telefone).
- Campos "Pago" / "A Pagar" (se habilitados nas Configurações) são clicáveis na tela antes de
  imprimir — marcar um desmarca o outro — com um campo pra digitar o valor a pagar, que sai em
  **negrito** na etiqueta. Se nenhum valor for digitado, imprime só a linha em branco pra
  preencher à mão, como antes.
- Cabeçalho da aplicação (logo, navegação, usuário) é ocultado na impressão — só a etiqueta vai
  pro papel.
- Cada etiqueta selecionada quebra em uma página própria, sem página em branco sobrando após a
  última (mesmo desmarcando etiquetas no meio da lista).
- O layout impresso é sempre claro (preto sobre branco), independente do tema escolhido na tela —
  impressora térmica não reproduz cores, e isso evita gastar papel/tinta com fundo escuro.

## Solução de problemas comuns

**"Não consegue conectar ao servidor SMTP"** — confira a porta: 465 usa TLS implícito (marque
"Conexão com TLS implícito" nas Configurações); qualquer outra porta (587, 25...) usa STARTTLS e
essa opção deve ficar **desmarcada**, senão dá erro de handshake TLS.

**Rotas da Vuupt não aparecem / erro 401/403** — confira o token em Configurações e use "Testar
conexão com a Vuupt". O token da Vuupt é um JWT "cru"; o sistema já normaliza automaticamente,
adicionando o prefixo `Bearer ` se ele não vier com um.

**Login via Zoho não aparece na tela de login** — precisa de Client ID, Client Secret e Redirect
URI preenchidos em Configurações. O Redirect URI cadastrado lá tem que ser **exatamente igual**
ao cadastrado em https://api-console.zoho.com.

**"Sua conta Zoho ainda não está cadastrada" ao tentar logar via Zoho** — um administrador
precisa criar o usuário primeiro (com o mesmo e-mail da conta Zoho) e marcar "Login via Zoho" no
cadastro dele.

**Login via Zoho funciona, mas ao final redireciona para `0.0.0.0:3000` (ou outro endereço
interno) em vez do domínio real** — configure `APP_BASE_URL` no `.env` do servidor com o domínio
público real (ex.: `https://impressos.evorafarma.com.br`) e reinicie o container. Sem essa
variável, o redirecionamento final usa o host que o Next.js enxerga na requisição, que atrás de
proxy/port-mapping pode não ser o domínio público.

**Logo enviada pela tela de Configurações não aparece em produção (Docker)** — se você estiver
numa imagem anterior à correção desse bug: o upload gravava em `public/uploads/`, mas o build
`standalone` do Next.js (usado na imagem Docker) só serve os arquivos de `public/` que existiam
no momento do build — um arquivo gravado ali em runtime dava 404, mesmo com o volume montado
certinho. Corrigido servindo os uploads por uma Route Handler dedicada
(`src/app/uploads/[filename]/route.ts`), que lê do disco a cada request, com os arquivos agora
guardados em `uploads/` (fora de `public/`). Se você já tinha um volume `vuupt-uploads` antigo
montado em `/app/public/uploads`, é só atualizar o `docker-compose.yml` (o volume passa a montar
em `/app/uploads`) e subir de novo com `docker compose pull && docker compose up -d` — o
conteúdo do volume é reaproveitado, não precisa reenviar a logo.

**Upload de logo em plataforma serverless** — o upload grava em disco (`uploads/`), o que
funciona bem em VPS/container com disco persistente (inclusive no Docker, via o volume
`vuupt-uploads`). Em plataformas serverless com sistema de arquivos efêmero (ex.: Vercel), esse
diretório não persiste entre deploys — nesse cenário seria necessário trocar por um serviço de
storage (S3, Vercel Blob etc.).
