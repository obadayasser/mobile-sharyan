import { NotificationType } from '@/constants/enums';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  titleAr: string | null;
  body: string;
  bodyAr: string | null;
  data: Record<string, any> | null;
  isRead: boolean;
  createdAt: string;
}

export interface BroadcastNotificationDto {
  title: string;
  body: string;
  titleAr?: string;
  bodyAr?: string;
}
