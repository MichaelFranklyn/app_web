import { afterEach, describe, expect, it, vi } from "vitest";

import { Notification } from "./interface";
import { INSIGHTS_ROUTE, isInsight, notificationHref, timeAgo } from "./utils";

const notification = (overrides: Partial<Notification> = {}): Notification => ({
  id: "n1",
  severity: "INFO",
  category: "ORDER",
  title: "Pedido faturado",
  body: null,
  link: "/orders/123",
  relatedEntityType: "order",
  relatedEntityId: "123",
  isRead: false,
  readAt: null,
  createdAt: "2026-09-12T12:00:00Z",
  ...overrides,
});

describe("para onde o aviso leva", () => {
  it("aviso de registro abre o registro", () => {
    expect(notificationHref(notification())).toBe("/orders/123");
  });

  it("insight vai para a tela de insights, não para um registro", () => {
    // O aviso do sino é a foto do dia em que o job rodou; em /insights o mesmo
    // assunto aparece com o número de hoje e o botão que resolve.
    const insight = notification({ category: "INSIGHT", link: "/clients/9" });

    expect(isInsight(insight)).toBe(true);
    expect(notificationHref(insight)).toBe(INSIGHTS_ROUTE);
  });

  it("aviso sem registro não leva a lugar nenhum", () => {
    expect(notificationHref(notification({ link: null }))).toBeNull();
  });
});

describe("timeAgo", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const since = (iso: string) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-12T12:00:00Z"));
    return timeAgo(iso);
  };

  it("mede a espera na maior unidade que ainda cabe", () => {
    expect(since("2026-09-12T11:59:30Z")).toBe("agora");
    expect(since("2026-09-12T11:48:00Z")).toBe("12min");
    expect(since("2026-09-12T09:00:00Z")).toBe("3h");
    expect(since("2026-09-07T12:00:00Z")).toBe("5d");
    expect(since("2026-08-29T12:00:00Z")).toBe("2sem");
  });
});
