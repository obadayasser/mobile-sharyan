import { api } from './api';
import { Campaign, CreateCampaignDto, UpdateCampaignDto } from '@/types/campaign';
import { PaginatedData } from '@/types/api';
import { CampaignStatus } from '@/constants/enums';

export const campaignService = {
  create: (data: CreateCampaignDto) => api.post<Campaign>('/campaigns', data),
  list: (params?: { status?: CampaignStatus; page?: number; limit?: number }) => api.get<PaginatedData<Campaign>>('/campaigns', params as any),
  getById: (id: string) => api.get<Campaign>(`/campaigns/${id}`),
  update: (id: string, data: UpdateCampaignDto) => api.patch<Campaign>(`/campaigns/${id}`, data),
  cancel: (id: string) => api.patch<Campaign>(`/campaigns/${id}/cancel`),
  register: (id: string) => api.post<void>(`/campaigns/${id}/register`),
  unregister: (id: string) => api.del<void>(`/campaigns/${id}/register`),
  markAttendance: (id: string, donorId: string) => api.patch<void>(`/campaigns/${id}/attendance/${donorId}`),
};
