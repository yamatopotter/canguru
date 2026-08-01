#!/bin/sh
set -e

echo "[entrypoint] Aplicando migrations do banco (inclui a criação do admin padrão, se ainda não existir)..."
node_modules/.bin/prisma migrate deploy

echo "[entrypoint] Rodando seed dos valores default de Configurações (idempotente)..."
node_modules/.bin/tsx prisma/seed.ts

echo "[entrypoint] Iniciando servidor..."
exec "$@"
