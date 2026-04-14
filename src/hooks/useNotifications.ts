import { useState, useCallback, useEffect, useRef } from 'react';
import useAuth from './useAuth';
import useGetRole from './useGetRole';
import { createLiveChatSocket } from '../services/liveChatRealtimeClient';
import notificationServices from '../services/notificationServices';
import type { Socket } from 'socket.io-client';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  status: 'READ' | 'UNREAD';
  relatedData: Record<string, any>;
  createdAt: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markMultipleAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markAllUnreadAsRead: () => Promise<void>;
  getUnreadCount: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteMultiple: (notificationIds: string[]) => Promise<void>;
  deleteAllForAgent: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook to manage notifications with real-time WebSocket updates
 * Fetches initial notifications and listens for new ones via WebSocket
 */
export const useNotifications = (): UseNotificationsReturn => {
  const { user, tenant, accessToken } = useAuth();
  const { isAdmin, isMasterAdmin, isSupportAgent } = useGetRole();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const isInitializedRef = useRef(false);

  // Select the appropriate service based on role
  const getNotificationService = useCallback(() => {
    if (isMasterAdmin) {
      return notificationServices.master;
    }
    return notificationServices.tenant;
  }, [isMasterAdmin]);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!accessToken || (!user?._id && !isMasterAdmin)) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const service = getNotificationService();
      const response = await service.getNotifications(accessToken, {
        page: 1,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: '-1',
      });

      if (response.success && response.data) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMsg);
      console.error('[NOTIFICATIONS] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, user?._id, isMasterAdmin, getNotificationService]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (isInitializedRef.current || !accessToken || (!user?._id && !isMasterAdmin)) {
      return;
    }

    isInitializedRef.current = true;

    try {
      const socket = createLiveChatSocket({
        apiKey: tenant?.apiKey || undefined,
        tenantId: tenant?.id || undefined,
        role: user?.role,
        agentId: user?._id,
      });

      if (!socket) {
        return;
      }

      socketRef.current = socket;

      // Listen for new notifications
      const handleNewNotification = (payload: { notification: Notification }) => {
        if (!payload?.notification) {
          return;
        }

        const newNotification = payload.notification;

        // Add to the beginning of the list
        setNotifications((prev) => {
          // Check if notification already exists
          const exists = prev.some((n) => n._id === newNotification._id);
          if (exists) {
            return prev;
          }
          return [newNotification, ...prev];
        });

        // Update unread count
        if (newNotification.status === 'UNREAD') {
          setUnreadCount((prev) => prev + 1);
        }

        console.log('[NOTIFICATIONS] New notification received:', newNotification);
      };

      socket.on('NOTIFICATION_CREATED', handleNewNotification);

      return () => {
        socket.off('NOTIFICATION_CREATED', handleNewNotification);
      };
    } catch (err) {
      console.error('[NOTIFICATIONS] WebSocket setup error:', err);
    }
  }, [accessToken, user?._id, user?.role, tenant?.apiKey, tenant?.id, isMasterAdmin]);

  // Fetch initial notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!accessToken) {
        return;
      }

      try {
        const service = getNotificationService();
        await service.markAsRead(accessToken, notificationId);

        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notificationId ? { ...n, status: 'READ' } : n
          )
        );

        // Update unread count
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('[NOTIFICATIONS] Mark as read error:', err);
        throw err;
      }
    },
    [accessToken, getNotificationService]
  );

  // Mark multiple notifications as read
  const markMultipleAsRead = useCallback(
    async (notificationIds: string[]) => {
      if (!accessToken || notificationIds.length === 0) {
        return;
      }

      try {
        const service = getNotificationService();
        await service.markMultipleAsRead(accessToken, notificationIds);

        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            notificationIds.includes(n._id) ? { ...n, status: 'READ' } : n
          )
        );

        // Update unread count
        const unreadInBatch = notifications.filter(
          (n) => notificationIds.includes(n._id) && n.status === 'UNREAD'
        ).length;
        setUnreadCount((prev) => Math.max(0, prev - unreadInBatch));
      } catch (err) {
        console.error('[NOTIFICATIONS] Mark multiple as read error:', err);
        throw err;
      }
    },
    [accessToken, notifications, getNotificationService]
  );

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      if (!accessToken) {
        return;
      }

      try {
        const service = getNotificationService();
        await service.deleteNotification(accessToken, notificationId);

        // Update local state
        setNotifications((prev) => prev.filter((n) => n._id !== notificationId));

        // Update unread count
        const deletedNotification = notifications.find((n) => n._id === notificationId);
        if (deletedNotification?.status === 'UNREAD') {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (err) {
        console.error('[NOTIFICATIONS] Delete error:', err);
        throw err;
      }
    },
    [accessToken, notifications, getNotificationService]
  );

  // Delete multiple notifications
  const deleteMultiple = useCallback(
    async (notificationIds: string[]) => {
      if (!accessToken || notificationIds.length === 0) {
        return;
      }

      try {
        const service = getNotificationService();
        await service.deleteMultiple(accessToken, notificationIds);

        // Update local state
        setNotifications((prev) =>
          prev.filter((n) => !notificationIds.includes(n._id))
        );

        // Update unread count
        const unreadInBatch = notifications.filter(
          (n) => notificationIds.includes(n._id) && n.status === 'UNREAD'
        ).length;
        setUnreadCount((prev) => Math.max(0, prev - unreadInBatch));
      } catch (err) {
        console.error('[NOTIFICATIONS] Delete multiple error:', err);
        throw err;
      }
    },
    [accessToken, notifications, getNotificationService]
  );

  // Mark all notifications as read for current user
  const markAllAsRead = useCallback(
    async () => {
      if (!accessToken) {
        return;
      }

      try {
        const service = getNotificationService();
        await service.markAllAsRead(accessToken);

        // Update local state
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, status: 'READ' }))
        );

        // Reset unread count
        setUnreadCount(0);
      } catch (err) {
        console.error('[NOTIFICATIONS] Mark all as read error:', err);
        throw err;
      }
    },
    [accessToken, getNotificationService]
  );

  // Mark all unread notifications as read for current user
  const markAllUnreadAsRead = useCallback(
    async () => {
      if (!accessToken) {
        return;
      }

      try {
        const service = getNotificationService();
        await service.markAllUnreadAsRead(accessToken);

        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.status === 'UNREAD' ? { ...n, status: 'READ' } : n
          )
        );

        // Reset unread count
        setUnreadCount(0);
      } catch (err) {
        console.error('[NOTIFICATIONS] Mark all unread as read error:', err);
        throw err;
      }
    },
    [accessToken, getNotificationService]
  );

  // Get unread count for current user
  const getUnreadCountFn = useCallback(
    async () => {
      if (!accessToken) {
        return;
      }

      try {
        const service = getNotificationService();
        const response = await service.getUnreadCount(accessToken);

        if (response.success && response.data?.unreadCount !== undefined) {
          setUnreadCount(response.data.unreadCount);
        }
      } catch (err) {
        console.error('[NOTIFICATIONS] Get unread count error:', err);
        throw err;
      }
    },
    [accessToken, getNotificationService]
  );

  // Delete all notifications for current user
  const deleteAllForAgent = useCallback(
    async () => {
      if (!accessToken) {
        return;
      }

      try {
        const service = getNotificationService();
        await service.deleteAllForAgent(accessToken);

        // Clear all notifications
        setNotifications([]);
        setUnreadCount(0);
      } catch (err) {
        console.error('[NOTIFICATIONS] Delete all error:', err);
        throw err;
      }
    },
    [accessToken, getNotificationService]
  );

  // Cleanup Socket.IO connection on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markMultipleAsRead,
    deleteNotification,
    deleteMultiple,
    markAllAsRead,
    markAllUnreadAsRead,
    getUnreadCount: getUnreadCountFn,
    deleteAllForAgent,
    refetch: fetchNotifications,
  };
};

export default useNotifications;
