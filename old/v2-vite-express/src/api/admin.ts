import { apiRequest, apiUpload } from './http';
import type { AppUser, Role, AuthProviderName } from '../types';

export function fetchUsers() {
  return apiRequest<{ users: AppUser[] }>('/api/admin/users');
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: Role;
  provider: AuthProviderName;
  password?: string;
}

export function createUser(input: CreateUserInput) {
  return apiRequest<{ user: AppUser }>('/api/admin/users', { method: 'POST', body: input });
}

export interface UpdateUserInput {
  name?: string;
  role?: Role;
  active?: boolean;
  password?: string;
}

export function updateUser(id: string, input: UpdateUserInput) {
  return apiRequest<{ user: AppUser }>(`/api/admin/users/${id}`, { method: 'PATCH', body: input });
}

export function deleteUser(id: string) {
  return apiRequest<{ ok: boolean }>(`/api/admin/users/${id}`, { method: 'DELETE' });
}

export interface AdminSettings {
  companyName: string;
  logoUrl: string | null;
  vuuptTokenConfigured: boolean;
  vuuptTokenMasked: string;
}

export function fetchAdminSettings() {
  return apiRequest<AdminSettings>('/api/admin/settings');
}

export interface UpdateSettingsInput {
  companyName?: string;
  vuuptApiToken?: string;
}

export function updateAdminSettings(input: UpdateSettingsInput) {
  return apiRequest<Pick<AdminSettings, 'companyName' | 'vuuptTokenConfigured' | 'vuuptTokenMasked'>>(
    '/api/admin/settings',
    { method: 'PUT', body: input },
  );
}

export function uploadLogo(file: File) {
  const formData = new FormData();
  formData.append('logo', file);
  return apiUpload<{ logoUrl: string }>('/api/admin/settings/logo', formData);
}
