'use client';

import { Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useNotifications } from '@/hooks/useNotifications';
import { useMarkNotificationRead } from '@/hooks/useMarkNotificationRead';
import { timeAgo } from '@/components/shared/constants';

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();

  const handleMarkRead = (id: string, isRead: boolean) => {
    if (!isRead) {
      markRead.mutate(id);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Chargement...
        </div>
      ) : notifications && notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-colors ${
                !notification.isRead ? 'border-primary/30 bg-muted/30' : ''
              }`}
              onClick={() => handleMarkRead(notification.id, notification.isRead)}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  {!notification.isRead && (
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    {notification.body && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.body}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {timeAgo(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            Aucune notification pour le moment.
          </p>
        </div>
      )}
    </div>
  );
}
