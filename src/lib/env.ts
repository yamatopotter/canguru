import 'server-only';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name} (veja .env.example)`);
  }
  return value;
}

// Só ficam aqui variáveis de infraestrutura, necessárias antes mesmo de
// consultar o banco (ex.: chave de assinatura de sessão) ou que descrevem o
// ambiente de deploy (HTTPS ou não). Configurações de negócio (Zoho, SMTP,
// token da Vuupt, nome/logo da empresa) ficam no banco, editáveis pela tela
// administrativa de Configurações — veja src/lib/settings.ts.
export const env = {
  jwtSecret: required('JWT_SECRET'),
  cookieSecure: process.env.COOKIE_SECURE === 'true',
};
