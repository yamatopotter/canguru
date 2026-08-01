import 'server-only';
import { countRecentActivity, type ActivityAction } from './activity';

const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_ATTEMPTS = 5;

/** true se o identificador já bateu o limite de tentativas na janela de tempo. */
export async function isRateLimited(action: ActivityAction, identifier: string): Promise<boolean> {
  const count = await countRecentActivity(action, identifier, WINDOW_MS);
  return count >= MAX_ATTEMPTS;
}

export const RATE_LIMIT_MESSAGE = 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
