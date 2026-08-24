"use client";

import { Title } from "@/components/Title";
import { Topbar } from "@/components/Topbar";
import { cn } from "@/lib/utils";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { ArrowRight, Bell, Check, CheckCheck } from "lucide-react";
import Link from "next/link";

// O sino é a PRÉVIA; a lista inteira, com filtro e paginação, está na central.
// Rótulos, cores e o `timeAgo` vêm do pai, para os dois contarem a mesma coisa.
import {
  INSIGHTS_ROUTE,
  SEVERITY_DOT,
  timeAgo,
} from "../../_shared/notifications/utils";
import { useNotificationCenter } from "./useNotificationCenter";

export function NotificationCenter() {
  const {
    open,
    setOpen,
    unreadCount,
    items,
    handleItemClick,
    handleMarkAllRead,
  } = useNotificationCenter();

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
            "tablet:w-[360px] z-50 flex w-[calc(100vw-24px)] flex-col border border-(--border) bg-(--bg2)",
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
                className="flex items-center gap-4 text-(--muted) hover:text-(--text)"
              >
                <CheckCheck size={12} />
                {/* text-inherit: a cor (e o hover) vêm do <button>, não do Title */}
                <Title variant="micro" className="text-inherit">
                  Marcar todas
                </Title>
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
                    "transition-colors last:border-b-0 hover:bg-(--bg3)",
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

          {/* A saída do sino é a AÇÃO, não mais avisos: aqui os itens são o que
              já aconteceu; lá está o que ainda precisa ser feito, com o motivo. */}
          <Link
            href={INSIGHTS_ROUTE}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center justify-center gap-6 border-t border-(--border) px-12 py-10",
              "text-(--muted) transition-colors hover:bg-(--bg3) hover:text-(--text)"
            )}
          >
            <Title variant="micro" weight="semibold" className="text-inherit">
              Ver o que está pendente
            </Title>
            <ArrowRight size={12} />
          </Link>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
