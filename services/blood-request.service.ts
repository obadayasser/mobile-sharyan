import { api } from './api';
import { BloodRequest, CreateBloodRequestDto, UpdateBloodRequestDto, BloodRequestSearchParams, NotifyDonorsResponse } from '@/types/blood-request';
import { PaginatedData } from '@/types/api';

export const bloodRequestService = {
  create: (data: CreateBloodRequestDto) => api.post<BloodRequest>('/blood-requests', data),
  list: (params: BloodRequestSearchParams) => api.get<PaginatedData<BloodRequest>>('/blood-requests', params as any),
  getById: (id: string) => api.get<BloodRequest>(`/blood-requests/${id}`),
  getByShareToken: (token: string) => api.get<BloodRequest>(`/blood-requests/share/${token}`),
  update: (id: string, data: UpdateBloodRequestDto) => api.patch<BloodRequest>(`/blood-requests/${id}`, data),
  cancel: (id: string) => api.patch<BloodRequest>(`/blood-requests/${id}/cancel`),
  notifyDonors: (id: string) => api.post<NotifyDonorsResponse>(`/blood-requests/${id}/notify-donors`),
};
