import { api } from './api';
import { BloodRequest } from '@/types/blood-request';

export const shareService = {
  generateLink: (requestId: string) => api.post<{ shareToken: string; shareUrl: string }>(`/share/blood-request/${requestId}`),
  resolveToken: (token: string) => api.get<BloodRequest>(`/share/${token}`),
};
