export type NotificationSeverity = "INFO" | "SUCCESS" | "WARNING" | "ERROR";
export type NotificationCategory =
  | "ORDER"
  | "VISIT"
  | "IMPORT"
  | "SCHEDULE"
  | "SYSTEM";

export interface Notification {
  id: string;
  severity: NotificationSeverity;
  category: NotificationCategory;
  title: string;
  body: string | null;
  link: string | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface MyNotificationsResponse {
  my_notifications: {
    edges: { node: Notification }[];
    totalCount: number;
  };
}

export interface MyUnreadCountResponse {
  myUnreadNotificationsCount: {
    status: boolean;
    data: number;
  };
}

export interface MarkAsReadResponse {
  markNotificationAsRead: {
    status: boolean;
    message: string;
    data: { id: string; isRead: boolean; readAt: string | null } | null;
  };
}

export interface MarkAllAsReadResponse {
  markAllNotificationsAsRead: {
    status: boolean;
    message: string;
  };
}
