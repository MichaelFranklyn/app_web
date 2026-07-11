"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useOptimisticObject } from "@/hooks/useOptimisticObject";

import {
  MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION,
  MARK_NOTIFICATION_AS_READ_MUTATION,
  MY_NOTIFICATIONS_QUERY,
  MY_UNREAD_NOTIFICATIONS_COUNT_QUERY,
} from "./gql";
import {
  MarkAllAsReadResponse,
  MarkAsReadResponse,
  MyNotificationsResponse,
  MyUnreadCountResponse,
  Notification,
} from "./interface";

/**
 * Motor do NotificationCenter: queries (contagem + lista), mutations de leitura
 * e o estado otimista (padrão único do app — badge e linha reagem antes do back).
 * O `index.tsx` fica só com a apresentação (dropdown + itens).
 */
export function useNotificationCenter() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const invalidateClient = useInvalidateQueriesClient();

  const { data: countData } = useQuery<MyUnreadCountResponse>(
    MY_UNREAD_NOTIFICATIONS_COUNT_QUERY,
    { pollInterval: 60000 }
  );

  const { data: listData, refetch } = useQuery<MyNotificationsResponse>(
    MY_NOTIFICATIONS_QUERY,
    {
      variables: { input: { first: 20 } },
      skip: !open,
      fetchPolicy: "cache-and-network",
    }
  );

  const [markAsRead] = useMutation<MarkAsReadResponse>(
    MARK_NOTIFICATION_AS_READ_MUTATION
  );
  const [markAllAsRead] = useMutation<MarkAllAsReadResponse>(
    MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION
  );
  const { execute } = useAsyncAction();

  // Estado exibido = hook otimista, seedado das queries (padrão único do app).
  const serverItems = useMemo(
    () => listData?.my_notifications?.edges.map((e) => e.node) ?? [],
    [listData]
  );
  const list = useOptimisticList<Notification>({ initialData: serverItems });
  const unread = useOptimisticObject<{ count: number }>({
    initialData: useMemo(
      () => ({ count: countData?.myUnreadNotificationsCount?.data ?? 0 }),
      [countData]
    ),
  });

  const unreadCount = unread.data.count;
  const items = list.items;

  const refreshCounts = async () => {
    await invalidateClient(["myUnreadNotificationsCount", "my_notifications"]);
  };

  const handleItemClick = (n: Notification) => {
    if (n.isRead) {
      setOpen(false);
      if (n.link) router.push(n.link);
      return;
    }

    // Otimista PRIMEIRO: marca a linha como lida e decrementa o badge na hora.
    list.updateOptimistic(n.id, {
      isRead: true,
      readAt: new Date().toISOString(),
    });
    unread.updateOptimistic({ count: Math.max(0, unread.data.count - 1) });
    setOpen(false);
    if (n.link) router.push(n.link);

    void execute(
      async () => {
        const res = await markAsRead({ variables: { id: n.id } });
        const payload = res.data?.markNotificationAsRead;
        if (!payload?.status) {
          throw new Error(payload?.message ?? "Erro ao marcar como lida");
        }
        return payload;
      },
      {
        onSuccess: () => {
          list.commit();
          unread.commit();
          void refreshCounts();
        },
        onError: () => {
          list.rollback();
          unread.rollback();
        },
      }
    );
  };

  const handleMarkAllRead = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Otimista PRIMEIRO: zera o badge e marca tudo como lido.
    const snapshot = list.items;
    list.setItems(snapshot.map((n) => ({ ...n, isRead: true })));
    unread.updateOptimistic({ count: 0 });

    void execute(
      async () => {
        const res = await markAllAsRead();
        const payload = res.data?.markAllNotificationsAsRead;
        if (!payload?.status) {
          throw new Error(payload?.message ?? "Erro ao marcar todas");
        }
        return payload;
      },
      {
        successMessage: "Todas as notificações marcadas como lidas",
        onSuccess: () => {
          unread.commit();
          void refreshCounts();
          void refetch();
        },
        onError: () => {
          list.setItems(snapshot);
          unread.rollback();
        },
      }
    );
  };

  return {
    open,
    setOpen,
    unreadCount,
    items,
    handleItemClick,
    handleMarkAllRead,
  };
}
