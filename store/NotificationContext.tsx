import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { notificationService } from '@/services/notification.service';

interface NotificationState {
  unreadCount: number;
  refreshCount: () => Promise<void>;
  decrementCount: () => void;
  resetCount: () => void;
}

const NotificationContext = createContext<NotificationState>({
  unreadCount: 0,
  refreshCount: async () => {},
  decrementCount: () => {},
  resetCount: () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isOnboarded, userType } = useAuth();
  const { notificationSocket } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshCount = useCallback(async () => {
    if (!isOnboarded || !userType || userType === 'ADMIN') return;
    try {
      const result = await notificationService.getUnreadCount(userType);
      setUnreadCount(result.count);
    } catch {}
  }, [isOnboarded, userType]);

  useEffect(() => {
    if (isOnboarded) refreshCount();
  }, [isOnboarded, refreshCount]);

  useEffect(() => {
    if (!notificationSocket) return;
    const handler = () => setUnreadCount((c) => c + 1);
    notificationSocket.on('notification', handler);
    return () => { notificationSocket.off('notification', handler); };
  }, [notificationSocket]);

  const decrementCount = useCallback(() => {
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const resetCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshCount, decrementCount, resetCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationCount() {
  return useContext(NotificationContext);
}
