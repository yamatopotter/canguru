import { apiRequest } from './http';
import type { AppUser } from '../types';

export function login(email: string, password: string) {
  return apiRequest<{ user: AppUser }>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function logout() {
  return apiRequest<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
}

export function fetchCurrentUser() {
  return apiRequest<{ user: AppUser }>('/api/auth/me');
}

export function fetchAuthProviders() {
  return apiRequest<{ zoho: boolean }>('/api/auth/providers');
}

export const ZOHO_LOGIN_URL = '/api/auth/zoho/start';
