# syntax=docker/dockerfile:1

# ---- deps: instala as dependências (cacheável enquanto o lockfile não muda) ----
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# ---- builder: gera o cliente Prisma e o build de produção do Next ----
FROM node:20-slim AS builder
WORKDIR /app
# Necessário pro Prisma detectar a versão certa do libssl (binaryTarget
# "debian-openssl-3.0.x") em vez de cair no fallback openssl-1.1.x.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
# JWT_SECRET só precisa existir pra passar da checagem em src/lib/env.ts
# durante a coleta de dados das páginas — o valor de verdade é passado em
# runtime (docker-compose.yml / "docker run -e"), este placeholder não vaza
# pro container final (estágio "runner" não herda ENV do "builder").
ENV JWT_SECRET=build-time-placeholder-not-used-in-runtime
RUN npm run build

# ---- runner: imagem final, só com o necessário pra rodar em produção ----
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# O engine do Prisma (binaryTarget "debian-openssl-3.0.x") precisa do
# libssl instalado no sistema em runtime, não só no build.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

# Build "standalone" do Next: server.js + node_modules mínimo (tracing não
# inclui public/ nem .next/static — precisam ser copiados à parte).
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Schema/migrations do Prisma (necessários em runtime pro entrypoint rodar
# "prisma migrate deploy" e "prisma db seed"). O entrypoint também precisa
# do CLI do Prisma e do tsx (+ dependências transitivas, ex. esbuild) pra
# rodar o seed — em vez de escolher pacote por pacote (frágil), sobrepomos
# o node_modules completo do estágio builder no lugar do podado pelo
# tracing do standalone.
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN mkdir -p /app/data /app/uploads /app/backups \
  && chmod +x ./docker-entrypoint.sh \
  && chown -R nextjs:nodejs /app/data /app/uploads /app/backups /app/prisma

USER nextjs
EXPOSE 3000
VOLUME ["/app/data", "/app/uploads", "/app/backups"]

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
