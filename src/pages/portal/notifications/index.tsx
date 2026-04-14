import React, { useState } from 'react';
import { Trash2, ArrowLeft, Mail } from 'lucide-react';
import { Typography, Checkbox } from '@mui/material';
import { useNavigate } from 'react-router';
import useNotifications from '../../../hooks/useNotifications';
import { formatDate } from '../../../utils/dateFormatter';
import { useDarkMode } from '../../../providers/DarkModeContext';
import useIsMobile from '../../../hooks/useMobile';

const NOTIFICATION_TYPES = {
  QUEUE: { label: 'Queue', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/25 dark:text-purple-300' },
  CHATS: { label: 'Chat', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/25 dark:text-blue-300' },
  NEW_TENANT: { label: 'New Tenant', color: 'bg-green-100 text-green-700 dark:bg-green-900/25 dark:text-green-300' },
  PLAN_CHANGE: { label: 'Plan Change', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/25 dark:text-orange-300' },
  TENANT_STATUS: { label: 'Tenant Status', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/25 dark:text-yellow-300' },
  PAYMENT: { label: 'Payment', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/25 dark:text-indigo-300' },
  AGENT_UPDATE: { label: 'Agent Update', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/25 dark:text-pink-300' },
};

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  status: 'READ' | 'UNREAD';
  relatedData: Record<string, any>;
  createdAt: string;
}

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useDarkMode();
  const isMobile = useIsMobile();

  const { notifications, unreadCount, markAsRead, deleteNotification, deleteMultiple, markMultipleAsRead } = useNotifications();

  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'READ' | 'UNREAD'>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [page, setPage] = useState(1);

  const itemsPerPage = 10;

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (filterStatus === 'READ' && n.status !== 'READ') return false;
    if (filterStatus === 'UNREAD' && n.status !== 'UNREAD') return false;
    if (filterType !== 'ALL' && n.type !== filterType) return false;
    return true;
  });

  // Paginate
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Toggle notification selection
  const toggleNotification = (id: string) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedNotifications(newSelected);
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedNotifications.size === paginatedNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      const allIds = new Set(paginatedNotifications.map((n) => n._id));
      setSelectedNotifications(allIds);
    }
  };

  // Handle delete selected
  const handleDeleteSelected = async () => {
    if (selectedNotifications.size === 0) return;

    try {
      await deleteMultiple(Array.from(selectedNotifications));
      setSelectedNotifications(new Set());
    } catch (err) {
      console.error('Failed to delete notifications:', err);
    }
  };

  // Handle mark selected as read
  const handleMarkSelectedAsRead = async () => {
    if (selectedNotifications.size === 0) return;

    try {
      await markMultipleAsRead(Array.from(selectedNotifications));
      setSelectedNotifications(new Set());
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    }
  };

  const getTypeColor = (type: string) => {
    const typeInfo = NOTIFICATION_TYPES[type as keyof typeof NOTIFICATION_TYPES];
    return typeInfo?.color || 'bg-gray-100 text-gray-700 dark:bg-gray-900/25 dark:text-gray-300';
  };

  const getTypeLabel = (type: string) => {
    const typeInfo = NOTIFICATION_TYPES[type as keyof typeof NOTIFICATION_TYPES];
    return typeInfo?.label || type;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors md:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                : 'All caught up!'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 space-y-4">
        {/* Filter Row */}
        <div className="flex flex-wrap gap-3">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as any);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm font-medium text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="ALL">All statuses</option>
            <option value="UNREAD">Unread</option>
            <option value="READ">Read</option>
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm font-medium text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="ALL">All types</option>
            {Object.entries(NOTIFICATION_TYPES).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Bar */}
        {selectedNotifications.size > 0 && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-slate-700">
            <Typography variant="body2" sx={{ color: isDark ? '#E2E8F0' : '#475569' }}>
              {selectedNotifications.size} selected
            </Typography>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleMarkSelectedAsRead}
                className="px-3 py-1.5 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
              >
                Mark as read
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        {paginatedNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Mail className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
            <Typography variant="h6" sx={{ color: isDark ? '#CBD5E1' : '#9CA3AF' }}>
              No notifications
            </Typography>
            <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#D1D5DB', mt: 1 }}>
              {filterStatus !== 'ALL' || filterType !== 'ALL' ? 'No notifications match your filters' : 'You\'re all caught up!'}
            </Typography>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {/* Head row */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700/50 flex items-center gap-3 sticky top-0">
              <Checkbox
                checked={selectedNotifications.size === paginatedNotifications.length && paginatedNotifications.length > 0}
                indeterminate={selectedNotifications.size > 0 && selectedNotifications.size < paginatedNotifications.length}
                onChange={toggleSelectAll}
                sx={{
                  color: isDark ? '#E2E8F0' : '#475569',
                  '&.Mui-checked': {
                    color: '#06B6D4',
                  },
                }}
              />
              <div className="flex-1">
                <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>
                  Notification
                </Typography>
              </div>
              {!isMobile && (
                <>
                  <div className="w-24">
                    <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>
                      Type
                    </Typography>
                  </div>
                  <div className="w-32">
                    <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>
                      Date
                    </Typography>
                  </div>
                </>
              )}
              <div className="w-8" />
            </div>

            {/* Notification rows */}
            {paginatedNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors ${notification.status === 'UNREAD' ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                  }`}
              >
                <Checkbox
                  checked={selectedNotifications.has(notification._id)}
                  onChange={() => toggleNotification(notification._id)}
                  sx={{
                    color: isDark ? '#E2E8F0' : '#475569',
                    '&.Mui-checked': {
                      color: '#06B6D4',
                    },
                    mt: 0.5,
                  }}
                />

                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => markAsRead(notification._id)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <Typography
                        variant="body2"
                        sx={{
                          color: isDark ? '#E2E8F0' : '#1F2937',
                          fontWeight: notification.status === 'UNREAD' ? 600 : 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {notification.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: isDark ? '#94A3B8' : '#6B7280',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block',
                          mt: 0.5,
                        }}
                      >
                        {notification.message}
                      </Typography>
                    </div>
                    {notification.status === 'UNREAD' && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>

                {!isMobile && (
                  <>
                    <div className="w-24">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                        {getTypeLabel(notification.type)}
                      </span>
                    </div>
                    <div className="w-32">
                      <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#6B7280' }}>
                        {formatDate(notification.createdAt)}
                      </Typography>
                    </div>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => deleteNotification(notification._id)}
                  className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between flex-wrap gap-3">
            <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#6B7280' }}>
              Page {page} of {totalPages}
            </Typography>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm font-medium border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm font-medium border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
