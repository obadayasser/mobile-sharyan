import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { createNotificationSocket, createChatSocket } from '@/services/socket';

interface SocketState {
  notificationSocket: Socket | null;
  chatSocket: Socket | null;
  isConnected: boolean;
  isChatConnected: boolean;
}

const SocketContext = createContext<SocketState>({
  notificationSocket: null,
  chatSocket: null,
  isConnected: false,
  isChatConnected: false,
});

const TAG = '[socket]';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { deviceId, userType, isOnboarded } = useAuth();
  const [notificationSocket, setNotificationSocket] = useState<Socket | null>(null);
  const [chatSocket, setChatSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isChatConnected, setIsChatConnected] = useState(false);

  useEffect(() => {
    if (!isOnboarded || !deviceId || !userType || userType === 'ADMIN') {
      console.log(`${TAG} skip - not ready`, { isOnboarded, deviceId: !!deviceId, userType });
      return;
    }

    console.log(`${TAG} creating sockets`, { deviceId, userType });
    const notifSocket = createNotificationSocket(deviceId, userType);
    const cSocket = createChatSocket(deviceId, userType);

    setNotificationSocket(notifSocket);
    setChatSocket(cSocket);

    const onNotifConnect = () => {
      console.log(`${TAG} notif CONNECT`, notifSocket.id);
      setIsConnected(true);
    };
    const onNotifDisconnect = (reason: string) => {
      console.log(`${TAG} notif DISCONNECT`, reason);
      setIsConnected(false);
    };
    const onNotifError = (err: any) => {
      console.warn(`${TAG} notif ERROR`, err?.message ?? err);
    };

    const onChatConnect = () => {
      console.log(`${TAG} chat CONNECT`, cSocket.id);
      setIsChatConnected(true);
    };
    const onChatDisconnect = (reason: string) => {
      console.log(`${TAG} chat DISCONNECT`, reason);
      setIsChatConnected(false);
    };
    const onChatError = (err: any) => {
      console.warn(`${TAG} chat ERROR`, err?.message ?? err);
    };
    const onChatAny = (event: string, ...args: any[]) => {
      console.log(`${TAG} chat <- "${event}"`, args);
    };

    notifSocket.on('connect', onNotifConnect);
    notifSocket.on('disconnect', onNotifDisconnect);
    notifSocket.on('connect_error', onNotifError);

    cSocket.on('connect', onChatConnect);
    cSocket.on('disconnect', onChatDisconnect);
    cSocket.on('connect_error', onChatError);
    cSocket.onAny(onChatAny);

    return () => {
      notifSocket.off('connect', onNotifConnect);
      notifSocket.off('disconnect', onNotifDisconnect);
      notifSocket.off('connect_error', onNotifError);
      cSocket.off('connect', onChatConnect);
      cSocket.off('disconnect', onChatDisconnect);
      cSocket.off('connect_error', onChatError);
      cSocket.offAny(onChatAny);
      notifSocket.disconnect();
      cSocket.disconnect();
      setNotificationSocket(null);
      setChatSocket(null);
      setIsConnected(false);
      setIsChatConnected(false);
    };
  }, [isOnboarded, deviceId, userType]);

  return (
    <SocketContext.Provider
      value={{ notificationSocket, chatSocket, isConnected, isChatConnected }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
