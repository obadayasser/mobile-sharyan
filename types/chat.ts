import { ChatMessageType } from '@/constants/enums';

export interface ChatRoom {
  id: string;
  bloodRequestId: string;
  donorId: string;
  patientId: string;
  donor?: { id: string; name: string };
  patient?: { id: string; name: string };
  lastMessage?: ChatMessage;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderType: string;
  content: string;
  type: ChatMessageType;
  createdAt: string;
}

export interface SendMessageDto {
  roomId: string;
  content: string;
  type?: ChatMessageType;
}
