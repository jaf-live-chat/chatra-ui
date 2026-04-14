import { API_BASE_URL } from '../constants/constants';

const getHeaders = (accessToken?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return headers;
};

/**
 * Notification Services for staff (agents/admins) - Uses tenant DB Notifications
 */
const tenantNotificationServices = {
  /**
   * Fetch notifications for current agent
   */
  async getNotifications(
    accessToken: string,
    query?: {
      page?: number;
      limit?: number;
      status?: 'READ' | 'UNREAD';
      type?: string;
      sortBy?: string;
      sortOrder?: string;
    }
  ) {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', String(query.page));
    if (query?.limit) params.append('limit', String(query.limit));
    if (query?.status) params.append('status', query.status);
    if (query?.type) params.append('type', query.type);
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder);

    const response = await fetch(
      `${API_BASE_URL}/agent-notifications?${params.toString()}`,
      {
        method: 'GET',
        headers: getHeaders(accessToken),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get unread count for current agent
   */
  async getUnreadCount(accessToken: string) {
    const response = await fetch(
      `${API_BASE_URL}/agent-notifications/unread/count`,
      {
        method: 'GET',
        headers: getHeaders(accessToken),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch unread count: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Mark single notification as read
   */
  async markAsRead(accessToken: string, notificationId: string) {
    const response = await fetch(
      `${API_BASE_URL}/agent-notifications/${notificationId}/read`,
      {
        method: 'PATCH',
        headers: getHeaders(accessToken),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to mark notification as read: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(accessToken: string, notificationIds: string[]) {
    const response = await fetch(
      `${API_BASE_URL}/agent-notifications/read-multiple`,
      {
        method: 'PATCH',
        headers: getHeaders(accessToken),
        body: JSON.stringify({ notificationIds }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to mark notifications as read: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Mark all notifications as read for current agent
   */
  async markAllAsRead(accessToken: string) {
    const response = await fetch(
      `${API_BASE_URL}/agent-notifications/read/all`,
      {
        method: 'PATCH',
        headers: getHeaders(accessToken),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to mark all notifications as read: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Mark all unread notifications as read for current agent
   */
  async markAllUnreadAsRead(accessToken: string) {
    const response = await fetch(
      `${API_BASE_URL}/agent-notifications/read/unread`,
      {
        method: 'PATCH',
        headers: getHeaders(accessToken),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to mark unread notifications as read: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Delete single notification
   */
  async deleteNotification(accessToken: string, notificationId: string) {
    const response = await fetch(
      `${API_BASE_URL}/agent-notifications/${notificationId}`,
      {
        method: 'DELETE',
        headers: getHeaders(accessToken),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete notification: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Delete multiple notifications
   */
  async deleteMultiple(accessToken: string, notificationIds: string[]) {
    const response = await fetch(
      `${API_BASE_URL}/agent-notifications`,
      {
        method: 'DELETE',
        headers: getHeaders(accessToken),
        body: JSON.stringify({ notificationIds }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete notifications: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Delete all notifications for current agent
   */
  async deleteAllForAgent(accessToken: string) {
    const response = await fetch(
      `${API_BASE_URL}/agent-notifications/all`,
      {
        method: 'DELETE',
        headers: getHeaders(accessToken),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete all notifications: ${response.statusText}`);
    }

    return response.json();
  },
};

/**
 * Notification Services for Master Admin - Uses master DB Notifications
 */
const masterNotificationServices = {
  /**
   * Fetch notifications for master admin
   */
  async getNotifications(
    accessToken: string,
    query?: {
      page?: number;
      limit?: number;
      status?: 'READ' | 'UNREAD';
      type?: string;
      sortBy?: string;
      sortOrder?: string;
    }
  ) {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', String(query.page));
    if (query?.limit) params.append('limit', String(query.limit));
    if (query?.status) params.append('status', query.status);
    if (query?.type) params.append('type', query.type);
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder);

    const response = await fetch(
      `${API_BASE_URL}/notifications?${params.toString()}`,
      {
        method: 'GET',
        headers: getHeaders(accessToken),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get unread count for master admin
   */
  async getUnreadCount(accessToken: string) {
    const response = await fetch(
      `${API_BASE_URL}/notifications/unread/count`,
      {
        method: 'GET',
        headers: getHeaders(accessToken),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch unread count: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Mark single notification as read
   */
  async markAsRead(accessToken: string, notificationId: string) {
    const response = await fetch(
      `${API_BASE_URL}/notifications/${notificationId}/read`,
      {
        method: 'PATCH',
        headers: getHeaders(accessToken),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to mark notification as read: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(accessToken: string, notificationIds: string[]) {
    const response = await fetch(
      `${API_BASE_URL}/notifications/read-multiple`,
      {
        method: 'PATCH',
        headers: getHeaders(accessToken),
        body: JSON.stringify({ notificationIds }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to mark notifications as read: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Mark all notifications as read for master admin
   */
  async markAllAsRead(accessToken: string) {
    const response = await fetch(
      `${API_BASE_URL}/notifications/read/all`,
      {
        method: 'PATCH',
        headers: getHeaders(accessToken),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to mark all notifications as read: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Mark all unread notifications as read for master admin
   */
  async markAllUnreadAsRead(accessToken: string) {
    const response = await fetch(
      `${API_BASE_URL}/notifications/read/unread`,
      {
        method: 'PATCH',
        headers: getHeaders(accessToken),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to mark unread notifications as read: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Delete single notification
   */
  async deleteNotification(accessToken: string, notificationId: string) {
    const response = await fetch(
      `${API_BASE_URL}/notifications/${notificationId}`,
      {
        method: 'DELETE',
        headers: getHeaders(accessToken),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete notification: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Delete multiple notifications
   */
  async deleteMultiple(accessToken: string, notificationIds: string[]) {
    const response = await fetch(
      `${API_BASE_URL}/notifications`,
      {
        method: 'DELETE',
        headers: getHeaders(accessToken),
        body: JSON.stringify({ notificationIds }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete notifications: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Delete all notifications for master admin
   */
  async deleteAllForAgent(accessToken: string) {
    const response = await fetch(
      `${API_BASE_URL}/notifications/all`,
      {
        method: 'DELETE',
        headers: getHeaders(accessToken),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete all notifications: ${response.statusText}`);
    }

    return response.json();
  },
};

export default {
  tenant: tenantNotificationServices,
  master: masterNotificationServices,
};
