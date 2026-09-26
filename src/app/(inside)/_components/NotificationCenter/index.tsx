"use client";
import { EmptyState } from "@/components/EmptyState";
import { Dot } from "@/components/Dot";
import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Dropdown } from "@/components/Dropdown";

import { Title } from "@/components/Title";
import { Topbar } from "@/components/Topbar";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Bell, Check, CheckCheck } from "lucide-react";

// O sino é a PRÉVIA; a lista inteira, com filtro e paginação, está na central.
// Rótulos, cores e o `timeAgo` vêm do pai, para os dois contarem a mesma coisa.
import {
  INSIGHTS_ROUTE,
  SEVERITY_COLOR,
  timeAgo,
} from "../../_shared/notifications/utils";
import { NotificationSkeleton } from "./NotificationSkeleton";
import { PushInviteRow } from "./PushInviteRow";
import { useNotificationCenter } from "./useNotificationCenter";

export function NotificationCenter() {
  const {
    open,
    setOpen,
    unreadCount,
    items,
    isLoading,
    handleItemClick,
    handleMarkAllRead,
    canInvitePush,
    enablePush,
    isEnablingPush,
  } = useNotificationCenter();

  return (
    <Dropdown.Root open={open} onOpenChange={setOpen}>
      <Dropdown.Trigger asChild>
        <Topbar.Notification unread={unreadCount > 0} />
      </Dropdown.Trigger>

      <Dropdown.Content
        panel
        align="end"
        sideOffset={8}
        className="tablet:w-[360px] w-[calc(100vw-24px)]"
      >
        <Dropdown.PanelHeader
          action={
            unreadCount > 0 && (
              <Button.Root
                appearance="ghost"
                color="neutral"
                size="xs"
                noUppercase
                onClick={handleMarkAllRead}
              >
                <Button.Icon icon={CheckCheck} />
                <Button.Title>Marcar todas</Button.Title>
              </Button.Root>
            )
          }
        >
          <Bell size={14} className="text-(--muted)" />
          <Title variant="body-sm" weight="semibold">
            Notificações
          </Title>
          {unreadCount > 0 && (
            <Badge.Root color="amber" appearance="tinted" size="xs">
              <Badge.Text>{unreadCount}</Badge.Text>
            </Badge.Root>
          )}
        </Dropdown.PanelHeader>

        <div className="flex max-h-[420px] flex-col overflow-y-auto">
          {isLoading ? (
            <NotificationSkeleton />
          ) : items.length === 0 ? (
            <EmptyState.Root flat className="gap-6 px-16 py-24">
              <EmptyState.Icon>
                <Bell size={20} />
              </EmptyState.Icon>
              <EmptyState.Description>
                Sem notificações por enquanto.
              </EmptyState.Description>
            </EmptyState.Root>
          ) : (
            items.map((n) => (
              <Dropdown.PanelRow
                key={n.id}
                tone={n.isRead ? "default" : "unread"}
                onClick={() => handleItemClick(n)}
              >
                <Dot.Root
                  color={SEVERITY_COLOR[n.severity]}
                  size="md"
                  pulse={false}
                  className="mt-[6px] opacity-100"
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
              </Dropdown.PanelRow>
            ))
          )}
        </div>

        {canInvitePush && (
          <PushInviteRow onEnable={enablePush} isLoading={isEnablingPush} />
        )}

        {/* A saída do sino é a AÇÃO, não mais avisos: aqui os itens são o que
            já aconteceu; lá está o que ainda precisa ser feito, com o motivo. */}
        <Dropdown.PanelFooter
          href={INSIGHTS_ROUTE}
          onClick={() => setOpen(false)}
        >
          Ver o que está pendente
        </Dropdown.PanelFooter>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
