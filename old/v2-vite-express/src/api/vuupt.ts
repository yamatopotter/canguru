import { apiRequest } from './http';
import type { Route, ServiceWithCustomer } from '../types';

export function fetchRoutes() {
  return apiRequest<{ routes: Route[] }>('/api/routes');
}

export function fetchRouteServices(routeId: string) {
  return apiRequest<{ services: ServiceWithCustomer[] }>(`/api/routes/${routeId}/services`);
}
