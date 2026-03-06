import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/constants/config';

export function createNotificationSocket(deviceId: string, userType: string): Socket {
  return io(`${SOCKET_URL}/notifications`, {
    auth: { deviceId, userType },
    transports: ['websocket'],
    autoConnect: true,
  });
}

export function createChatSocket(deviceId: string, userType: string): Socket {
  return io(`${SOCKET_URL}/chat`, {
    auth: { deviceId, userType },
    transports: ['websocket'],
    autoConnect: true,
  });
}
