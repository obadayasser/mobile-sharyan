import { api } from './api';
import { Donor, RegisterDonorDto, UpdateDonorDto, DonorSearchParams, DonorSearchResult } from '@/types/donor';
import { PaginatedData } from '@/types/api';
import { DonorBadge } from '@/types/gamification';
import { Donation } from '@/types/donation';
import { DonationOffer } from '@/types/blood-request';

export const donorService = {
  register: (data: RegisterDonorDto) => api.post<Donor>('/donors/register', data),
  getMe: () => api.get<Donor>('/donors/me'),
  updateMe: (data: UpdateDonorDto) => api.patch<Donor>('/donors/me', data),
  search: (params: DonorSearchParams) => api.get<PaginatedData<DonorSearchResult>>('/donors/search', params as any),
  getMyDonations: (page = 1, limit = 20) => api.get<PaginatedData<Donation>>('/donors/me/donations', { page, limit }),
  getMyOffers: (page = 1, limit = 20) => api.get<PaginatedData<DonationOffer>>('/donors/me/offers', { page, limit }),
  getMyBadges: () => api.get<DonorBadge[]>('/donors/me/badges'),
  getMyPoints: (page = 1, limit = 20) => api.get<any>('/donors/me/points', { page, limit }),
  updateFcmToken: (fcmToken: string) => api.patch<void>('/donors/me/fcm-token', { fcmToken }),
  toggleAvailability: (isAvailable: boolean) => api.patch<void>('/donors/me/availability', { isAvailable }),
};
