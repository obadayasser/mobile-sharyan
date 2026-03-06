import { api } from './api';
import { BloodStock, UpdateBloodStockDto, ShortageAlert, CreateShortageAlertDto } from '@/types/blood-stock';
import { PaginatedData } from '@/types/api';

export const bloodStockService = {
  update: (data: UpdateBloodStockDto) => api.put<BloodStock>('/blood-stock', data),
  getByBank: (bankId: string) => api.get<BloodStock[]>(`/blood-stock/bank/${bankId}`),
  createShortageAlert: (data: CreateShortageAlertDto) => api.post<ShortageAlert>('/blood-stock/shortage-alert', data),
  getShortageAlerts: (page = 1, limit = 20) => api.get<PaginatedData<ShortageAlert>>('/blood-stock/shortage-alerts', { page, limit }),
  resolveShortageAlert: (id: string) => api.patch<void>(`/blood-stock/shortage-alerts/${id}/resolve`),
};
