'use server';

import { requireUser } from '@/lib/auth/guards';
import { ACTIVITY_ACTIONS, logActivity } from '@/lib/activity';

export async function logPrintAction(routeId: string, routeName: string, serviceCount: number): Promise<void> {
  const user = await requireUser();

  await logActivity({
    actorId: user.id,
    actorName: user.name,
    action: ACTIVITY_ACTIONS.routePrint,
    targetType: 'route',
    targetId: routeId,
    metadata: { routeName, serviceCount },
  });
}
