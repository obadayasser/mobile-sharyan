import { api } from './api';
import { DonationOffer, CreateDonationOfferDto } from '@/types/blood-request';

export const donationOfferService = {
  create: (data: CreateDonationOfferDto) => api.post<DonationOffer>('/donation-offers', data),
  getByRequest: (requestId: string) => api.get<DonationOffer[]>(`/donation-offers/request/${requestId}`),
  accept: (id: string) => api.patch<DonationOffer>(`/donation-offers/${id}/accept`),
  reject: (id: string) => api.patch<DonationOffer>(`/donation-offers/${id}/reject`),
  complete: (id: string) => api.patch<DonationOffer>(`/donation-offers/${id}/complete`),
  cancel: (id: string) => api.patch<DonationOffer>(`/donation-offers/${id}/cancel`),
};
