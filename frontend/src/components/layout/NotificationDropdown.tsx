'use client';

import Link from 'next/link';
import { useNotifications } from '@/hooks/useNotifications';
import { useMarkNotificationRead } from '@/hooks/useMarkNotificationRead';
import { Separator } from '@/components/ui/separator';
import { timeAgo } from '@/components/shared/constants';

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { data: notifications } = useNotifications();
  const markRead = useMarkNotificationRead();

  const recent = notifications?.slice(0, 5) ?? [];

  const handleClick = (id: string, isRead: boolean) => {
    if (!isRead) {
      markRead.mutate(id);
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-popover p-0 shadow-lg z-50">
      <div className="px-4 py-3 font-semibold text-sm">Notifications</div>
      <Separator />
      {recent.length > 0 ? (
        <div className="max-h-80 overflow-y-auto">
          {recent.map((notification) => (
            <button
              key={notification.id}
              className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${
                !notification.isRead ? 'bg-muted/30' : ''
              }`}
              onClick={() => handleClick(notification.id, notification.isRead)}
            >
              <div className="flex items-start gap-2">
                {!notification.isRead && (
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {notification.title}
                  </p>
                  {notification.body && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.body}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {timeAgo(notification.createdAt)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
          Aucune notification
        </div>
      )}
      <Separator />
      <Link
        href="/notifications"
        className="block px-4 py-3 text-center text-sm font-medium text-primary hover:bg-muted/50 transition-colors"
        onClick={onClose}
      >
        Voir toutes les notifications
      </Link>
    </div>
  );
}
