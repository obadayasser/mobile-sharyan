import { api } from './api';
import { Donation, CreateDonationDto, DonationStats } from '@/types/donation';
import { PaginatedData } from '@/types/api';

export const donationService = {
  create: (data: CreateDonationDto) => api.post<Donation>('/donations', data),
  list: (page = 1, limit = 20) => api.get<PaginatedData<Donation>>('/donations', { page, limit }),
  getStats: () => api.get<DonationStats>('/donations/stats'),
  getById: (id: string) => api.get<Donation>(`/donations/${id}`),
};
