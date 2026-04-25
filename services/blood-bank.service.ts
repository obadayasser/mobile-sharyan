import { api } from './api';
import { BloodBank, RegisterBloodBankDto, UpdateBloodBankDto } from '@/types/blood-bank';
import { PaginatedData } from '@/types/api';
import { BloodStock } from '@/types/blood-stock';

export const bloodBankService = {
  register: (data: RegisterBloodBankDto) => api.post<BloodBank>('/blood-banks/register', data),
  list: (page = 1, limit = 20) => api.get<PaginatedData<BloodBank>>('/blood-banks', { page, limit }),
  getById: (id: string) => api.get<BloodBank>(`/blood-banks/${id}`),
  updateMe: (data: UpdateBloodBankDto) => api.patch<BloodBank>('/blood-banks/me', data),
  getMyStock: () => api.get<BloodStock[]>('/blood-banks/me/stock'),
  getPending: () => api.get<BloodBank[]>('/blood-banks/pending'),
  approve: (id: string) => api.patch<BloodBank>(`/blood-banks/${id}/approve`),
  reject: (id: string) => api.patch<BloodBank>(`/blood-banks/${id}/reject`),
  suspend: (id: string) => api.patch<BloodBank>(`/blood-banks/${id}/suspend`),
  updateFcmToken: (fcmToken: string) => api.patch<void>('/blood-banks/me/fcm-token', { fcmToken }),
};
