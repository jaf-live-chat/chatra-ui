import React from 'react';
import { Bell } from 'lucide-react';

interface NotificationIconProps {
  unreadCount: number;
  onClick: () => void;
  isOpen?: boolean;
}

/**
 * NotificationIcon component - Bell icon with unread badge
 * Shows unread count in a red badge
 */
const NotificationIcon: React.FC<NotificationIconProps> = ({
  unreadCount,
  onClick,
  isOpen = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative p-2 rounded-lg text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
      aria-label="Notifications"
      aria-expanded={isOpen}
    >
      <Bell className="w-5 h-5" />

      {/* Unread badge */}
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
    </button>
  );
};

export default NotificationIcon;
