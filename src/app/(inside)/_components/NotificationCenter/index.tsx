"use client";

import { Title } from "@/components/Title";
import { Topbar } from "@/components/Topbar";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { cn } from "@/lib/utils";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { useMutation, useQuery } from "@apollo/client/react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  NotificationSeverity,
} from "./interface";

const SEVERITY_DOT: Record<NotificationSeverity, string> = {
  INFO: "bg-(--blue)",
  SUCCESS: "bg-(--green)",
  WARNING: "bg-(--amber)",
  ERROR: "bg-(--red)",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.round(diff / 1000);
  if (sec < 60) return "agora";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}min`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.round(days / 7);
  return `${weeks}sem`;
}

export function NotificationCenter() {
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

  const unreadCount = countData?.myUnreadNotificationsCount?.data ?? 0;
  const items = listData?.my_notifications?.edges.map((e) => e.node) ?? [];

  const refreshCounts = async () => {
    await invalidateClient([
      "myUnreadNotificationsCount",
      "my_notifications",
    ]);
  };

  const handleItemClick = async (n: Notification) => {
    if (!n.isRead) {
      await markAsRead({ variables: { id: n.id } });
      await refreshCounts();
    }
    setOpen(false);
    if (n.link) {
      router.push(n.link);
    }
  };

  const handleMarkAllRead = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    await markAllAsRead();
    await refreshCounts();
    await refetch();
  };

  return (
    <DropdownMenuPrimitive.Root open={open} onOpenChange={setOpen}>
      <DropdownMenuPrimitive.Trigger asChild>
        <Topbar.Notification unread={unreadCount > 0} />
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          sideOffset={8}
          className={cn(
            "z-50 flex w-[360px] flex-col border border-(--border) bg-(--bg2)",
            "rounded-(--r-lg) shadow-(--shadow-md)",
            "animate-in fade-in zoom-in-95 duration-150"
          )}
        >
          <div className="flex items-center justify-between border-b border-(--border) px-12 py-10">
            <div className="flex items-center gap-8">
              <Bell size={14} className="text-(--muted)" />
              <Title variant="body-sm" weight="semibold">
                Notificações
              </Title>
              {unreadCount > 0 && (
                <Title
                  variant="micro"
                  color="amber"
                  weight="semibold"
                  className="rounded-full bg-(--amber-bg) px-6 py-[2px]"
                >
                  {unreadCount}
                </Title>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-4 text-[12px] text-(--muted) hover:text-(--text)"
              >
                <CheckCheck size={12} />
                Marcar todas
              </button>
            )}
          </div>

          <div className="flex max-h-[420px] flex-col overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-6 px-16 py-24 text-center">
                <Bell size={20} className="text-(--muted2)" />
                <Title variant="body-sm" color="muted">
                  Sem notificações por enquanto.
                </Title>
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleItemClick(n)}
                  className={cn(
                    "flex items-start gap-10 border-b border-(--border) px-12 py-10 text-left",
                    "hover:bg-(--bg3) transition-colors last:border-b-0",
                    !n.isRead && "bg-(--bg3)/40"
                  )}
                >
                  <span
                    className={cn(
                      "mt-[6px] h-[8px] w-[8px] shrink-0 rounded-full",
                      SEVERITY_DOT[n.severity]
                    )}
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-center justify-between gap-8">
                      <Title
                        variant="body-sm"
                        weight="semibold"
                        className="truncate"
                      >
                        {n.title}
                      </Title>
                      <Title variant="micro" color="muted" className="shrink-0">
                        {timeAgo(n.createdAt)}
                      </Title>
                    </div>
                    {n.body && (
                      <Title
                        variant="body-xs"
                        color="secondary"
                        className="line-clamp-2"
                      >
                        {n.body}
                      </Title>
                    )}
                  </div>
                  {!n.isRead && (
                    <Check
                      size={12}
                      className="mt-[4px] shrink-0 text-(--muted2)"
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
