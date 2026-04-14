import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';

interface RelatedData {
  conversationId?: string;
  queueId?: string;
  queueEntryId?: string;
  tenantId?: string;
  paymentId?: string;
  [key: string]: any;
}

interface NotificationMapping {
  type: string;
  path: string;
  filterKey?: string;
  filterValue?: string;
}

const NOTIFICATION_ROUTE_MAP: Record<string, NotificationMapping> = {
  QUEUE: {
    type: 'QUEUE',
    path: '/portal/queue',
  },
  CHATS: {
    type: 'CHATS',
    path: '/portal/chats',
    filterKey: 'conversationId',
  },
  NEW_TENANT: {
    type: 'NEW_TENANT',
    path: '/portal/tenants',
  },
  PLAN_CHANGE: {
    type: 'PLAN_CHANGE',
    path: '/portal/subscriptions',
  },
  TENANT_STATUS: {
    type: 'TENANT_STATUS',
    path: '/portal/tenants',
  },
  PAYMENT: {
    type: 'PAYMENT',
    path: '/portal/payments',
  },
  AGENT_UPDATE: {
    type: 'AGENT_UPDATE',
    path: '/portal/agents',
  },
};

interface UseNotificationNavigationProps {
  notificationType?: string;
  relatedData?: RelatedData;
  onNavigate?: () => void;
}

/**
 * Hook to handle notification navigation and auto-dismiss
 * Navigates to the appropriate page based on notification type
 * Auto-marks notification as read when user navigates to that page
 */
export const useNotificationNavigation = ({
  notificationType,
  relatedData,
  onNavigate,
}: UseNotificationNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Navigate to the appropriate page for this notification
   */
  const navigateToNotification = useCallback(() => {
    if (!notificationType) {
      return;
    }

    const mapping = NOTIFICATION_ROUTE_MAP[notificationType];
    if (!mapping) {
      console.warn(`[NOTIFICATION-NAV] Unknown notification type: ${notificationType}`);
      return;
    }

    const path = mapping.path;

    // For CHATS, add conversationId as query parameter to auto-select
    if (notificationType === 'CHATS' && relatedData?.conversationId) {
      navigate(`${path}?conversationId=${relatedData.conversationId}`);
    }
    // For QUEUE, add queueId to auto-filter
    else if (notificationType === 'QUEUE' && relatedData?.queueId) {
      navigate(`${path}?queueId=${relatedData.queueId}`);
    }
    // For TENANTS, add tenantId
    else if ((notificationType === 'NEW_TENANT' || notificationType === 'TENANT_STATUS') && relatedData?.tenantId) {
      navigate(`${path}?tenantId=${relatedData.tenantId}`);
    }
    // For PAYMENTS
    else if (notificationType === 'PAYMENT' && relatedData?.paymentId) {
      navigate(`${path}?paymentId=${relatedData.paymentId}`);
    }
    // Default navigation without query params
    else {
      navigate(path);
    }

    onNavigate?.();
  }, [navigate, notificationType, relatedData, onNavigate]);

  /**
   * Check if we're on the page for this notification (for auto-dismiss)
   */
  const isCurrentPage = useCallback(() => {
    if (!notificationType) {
      return false;
    }

    const mapping = NOTIFICATION_ROUTE_MAP[notificationType];
    if (!mapping) {
      return false;
    }

    // Check if current path matches the notification's path
    return location.pathname === mapping.path;
  }, [notificationType, location.pathname]);

  return {
    navigateToNotification,
    isCurrentPage,
    targetPath: notificationType ? NOTIFICATION_ROUTE_MAP[notificationType]?.path : undefined,
  };
};

export default useNotificationNavigation;
