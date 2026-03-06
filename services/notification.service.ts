import { api } from './api';
import { Notification, BroadcastNotificationDto } from '@/types/notification';
import { PaginatedData } from '@/types/api';

export const notificationService = {
  list: (params: { userType: string; page?: number; limit?: number }) => api.get<PaginatedData<Notification>>('/notifications', params as any),
  getUnreadCount: (userType: string) => api.get<{ count: number }>('/notifications/unread-count', { userType }),
  markRead: (id: string) => api.patch<void>(`/notifications/${id}/read`),
  markAllRead: (userType: string) => api.patch<void>('/notifications/read-all', { userType } as any),
  broadcast: (data: BroadcastNotificationDto) => api.post<void>('/notifications/broadcast', data),
};
