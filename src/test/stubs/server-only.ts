// Stub para os testes: o pacote real "server-only" lança um erro quando
// importado fora do bundler do Next.js, o que quebraria a importação de
// qualquer módulo de src/lib sob o Vitest. O vitest.config.ts faz o alias
// de "server-only" para este arquivo (que não faz nada) só no ambiente de teste.
export {};
