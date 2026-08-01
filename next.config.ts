import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build "standalone": copia só o necessário pra rodar em produção
  // (node_modules mínimo + server.js), usado pela imagem Docker.
  output: "standalone",
};

export default nextConfig;
