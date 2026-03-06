import { api } from './api';
import { ChatRoom, ChatMessage } from '@/types/chat';
import { PaginatedData } from '@/types/api';

export const chatService = {
  createRoom: (bloodRequestId: string) => api.post<ChatRoom>('/chat/rooms', { bloodRequestId }),
  getRooms: () => api.get<ChatRoom[]>('/chat/rooms'),
  getMessages: (roomId: string, page = 1, limit = 50) => api.get<PaginatedData<ChatMessage>>(`/chat/rooms/${roomId}/messages`, { page, limit }),
};
