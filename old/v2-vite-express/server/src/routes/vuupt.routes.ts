import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { fetchCustomerName, fetchRecentRoutes, fetchServicesByRoute } from '../services/vuupt';

const DAYS_TO_LOOK_BACK = 2;

export const vuuptRouter = Router();

vuuptRouter.use(requireAuth);

vuuptRouter.get(
  '/routes',
  asyncHandler(async (_req, res) => {
    const since = new Date();
    since.setDate(since.getDate() - DAYS_TO_LOOK_BACK);
    const routes = await fetchRecentRoutes(since);
    res.json({ routes });
  }),
);

vuuptRouter.get(
  '/routes/:routeId/services',
  asyncHandler(async (req, res) => {
    const services = await fetchServicesByRoute(req.params.routeId);

    const enriched = await Promise.all(
      services.map(async (service) => {
        let customerName: string | null = null;
        try {
          customerName = await fetchCustomerName(service.customer_id);
        } catch {
          customerName = null;
        }
        return { ...service, customerName };
      }),
    );

    res.json({ services: enriched });
  }),
);
