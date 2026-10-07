import { apiGet, apiPost } from "./client";

export type UserNotification = {
  id: number;
  type: string;
  title: string;
  body?: string | null;
  entityType?: string | null;
  entityId?: string | number | null;
  readAt?: string | null;
  createdAt?: string | null;
};

type NotificationPageEnvelope = {
  content?: UserNotification[];
  totalElements?: number;
};

export type NotificationInbox = {
  items: UserNotification[];
  total: number;
  unreadCount: number;
};

export async function listNotifications(options?: {
  unreadOnly?: boolean;
  page?: number;
  size?: number;
}): Promise<NotificationInbox> {
  const params = {
    unreadOnly: options?.unreadOnly ?? false,
    page: options?.page ?? 0,
    size: Math.min(Math.max(options?.size ?? 10, 1), 50),
  };
  const [page, unread] = await Promise.all([
    apiGet<NotificationPageEnvelope | UserNotification[]>("/notifications/me", { params }),
    apiGet<{ unread?: number }>("/notifications/me/unread-count").catch(() => ({ unread: 0 })),
  ]);
  const items = Array.isArray(page) ? page : (page.content ?? []);
  return {
    items,
    total: Array.isArray(page) ? items.length : (page.totalElements ?? items.length),
    unreadCount: unread.unread ?? 0,
  };
}

export function markNotificationRead(notificationId: number) {
  return apiPost(`/notifications/${notificationId}/read`, {});
}

export function markAllNotificationsRead() {
  return apiPost("/notifications/me/read-all", {});
}
