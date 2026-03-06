import { api } from './api';
import { Admin, AdminLoginDto, AdminTokens } from '@/types/admin';

export const authService = {
  adminLogin: (data: AdminLoginDto) => api.post<AdminTokens>('/auth/admin/login', data),
  adminRefresh: (refreshToken: string) => api.post<AdminTokens>('/auth/admin/refresh', { refreshToken }),
  adminLogout: () => api.post<void>('/auth/admin/logout'),
  getAdminProfile: () => api.get<Admin>('/auth/admin/me'),
};
