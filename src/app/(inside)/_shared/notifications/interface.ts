export type NotificationSeverity = "INFO" | "SUCCESS" | "WARNING" | "ERROR";
/**
 * Categorias como o backend as NOMEIA (`NotificationCategory`, em maiúsculas).
 *
 * INSIGHT é a leitura do sistema — o job olhou os dados e concluiu algo. É a
 * única em que o aviso É o conteúdo: as demais apontam para um registro que
 * existe em outra tela. Ver `notificationHref` em `utils.ts`.
 */
export type NotificationCategory =
  | "ORDER"
  | "VISIT"
  | "IMPORT"
  | "SCHEDULE"
  | "INSIGHT"
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
    pageInfo?: { hasNextPage: boolean; endCursor: string | null };
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
