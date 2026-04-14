import React, { useMemo } from 'react';
import {
  X,
  ArrowRight,
  Trash2,
  ListTodo,
  MessageCircle,
  Building2,
  TrendingUp,
  Settings,
  CreditCard,
  User,
  Bell,
} from 'lucide-react';
import { Typography } from '@mui/material';
import { formatDate } from '../../utils/dateFormatter';
import { useDarkMode } from '../../providers/DarkModeContext';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  status: 'READ' | 'UNREAD';
  relatedData: Record<string, any>;
  createdAt: string;
}

interface NotificationPopupProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onViewAll: () => void;
  onDelete: (notificationId: string) => void;
  onNavigate: (notification: Notification) => void;
  isLoading?: boolean;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({
  notifications,
  isOpen,
  onClose,
  onViewAll,
  onDelete,
  onNavigate,
  isLoading = false,
}) => {
  const { isDark } = useDarkMode();

  // Show recent 5 notifications
  const recentNotifications = useMemo(() => {
    return notifications.slice(0, 5);
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    const iconProps = {
      className: 'w-5 h-5 text-cyan-600 dark:text-cyan-400',
      strokeWidth: 2,
    };

    switch (type) {
      case 'QUEUE':
        return <ListTodo {...iconProps} />;
      case 'CHATS':
        return <MessageCircle {...iconProps} />;
      case 'NEW_TENANT':
        return <Building2 {...iconProps} />;
      case 'PLAN_CHANGE':
        return <TrendingUp {...iconProps} />;
      case 'TENANT_STATUS':
        return <Settings {...iconProps} />;
      case 'PAYMENT':
        return <CreditCard {...iconProps} />;
      case 'AGENT_UPDATE':
        return <User {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Popup Container */}
      <div
        className={`absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg dark:shadow-slate-900/50 z-50 max-h-[28rem] flex flex-col overflow-hidden transition-all duration-200 ${isOpen
          ? 'visible translate-y-0 opacity-100'
          : 'invisible translate-y-1 opacity-0'
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-700 shrink-0">
          <Typography variant="subtitle2" sx={{ color: isDark ? '#E2E8F0' : '#1F2937' }}>
            Notifications
          </Typography>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            aria-label="Close notifications"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Typography
                  variant="body2"
                  sx={{ color: isDark ? '#94A3B8' : '#64748B' }}
                >
                  Loading...
                </Typography>
              </div>
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="flex items-center justify-center py-8 px-4">
              <div className="text-center">
                <div className="flex justify-center mb-3"> <Bell /> </div>
                <Typography
                  variant="body2"
                  sx={{ color: isDark ? '#94A3B8' : '#64748B' }}
                >
                  No notifications yet
                </Typography>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {recentNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group ${notification.status === 'UNREAD'
                    ? 'bg-blue-50/50 dark:bg-blue-900/15'
                    : ''
                    }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="shrink-0 flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => onNavigate(notification)}
                    >
                      <div className="flex items-start gap-2">
                        <Typography
                          variant="body2"
                          sx={{
                            color: isDark ? '#E2E8F0' : '#1F2937',
                            fontWeight: notification.status === 'UNREAD' ? 600 : 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {notification.title}
                        </Typography>
                        {notification.status === 'UNREAD' && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                        )}
                      </div>

                      <Typography
                        variant="caption"
                        sx={{
                          color: isDark ? '#94A3B8' : '#64748B',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          mt: 0.5,
                        }}
                      >
                        {notification.message}
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{
                          color: isDark ? '#475569' : '#94A3B8',
                          fontSize: '0.65rem',
                          mt: 0.75,
                        }}
                      >
                        {formatDate(notification.createdAt)}
                      </Typography>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate(notification);
                        }}
                        className="p-1 text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                        aria-label="Open notification"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(notification._id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        aria-label="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {recentNotifications.length > 0 && (
          <div className="border-t border-gray-100 dark:border-slate-700 p-2 shrink-0">
            <button
              type="button"
              onClick={onViewAll}
              className="w-full px-3 py-2 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
            >
              View all notifications
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationPopup;
