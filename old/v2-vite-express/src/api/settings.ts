import { apiRequest } from './http';

export interface PublicSettings {
  companyName: string;
  logoUrl: string | null;
}

export function fetchPublicSettings() {
  return apiRequest<PublicSettings>('/api/settings/public');
}
