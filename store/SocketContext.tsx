import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { createNotificationSocket, createChatSocket } from '@/services/socket';

interface SocketState {
  notificationSocket: Socket | null;
  chatSocket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketState>({
  notificationSocket: null,
  chatSocket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { deviceId, userType, isOnboarded } = useAuth();
  const notifSocketRef = useRef<Socket | null>(null);
  const chatSocketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isOnboarded || !deviceId || !userType || userType === 'ADMIN') return;

    const notifSocket = createNotificationSocket(deviceId, userType);
    const chatSocket = createChatSocket(deviceId, userType);

    notifSocketRef.current = notifSocket;
    chatSocketRef.current = chatSocket;

    notifSocket.on('connect', () => setIsConnected(true));
    notifSocket.on('disconnect', () => setIsConnected(false));

    return () => {
      notifSocket.disconnect();
      chatSocket.disconnect();
      notifSocketRef.current = null;
      chatSocketRef.current = null;
      setIsConnected(false);
    };
  }, [isOnboarded, deviceId, userType]);

  return (
    <SocketContext.Provider value={{
      notificationSocket: notifSocketRef.current,
      chatSocket: chatSocketRef.current,
      isConnected,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
