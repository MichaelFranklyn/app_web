import { expect, test } from "../support/fixtures";
import { emptyDashboardQueries, mockGraphql } from "../support/graphql";

/**
 * Lote 5 — central de notificações (sino no topbar, presente em toda página interna).
 * Abre no /dashboard; marca todas como lidas.
 */
test("notificações: marca todas como lidas", async ({ page }) => {
  await mockGraphql(page, {
    ...emptyDashboardQueries,
    MyUnreadNotificationsCount: () => ({
      myUnreadNotificationsCount: { status: true, data: 1 },
    }),
    MyNotifications: () => ({
      my_notifications: {
        edges: [
          {
            node: {
              id: "notif-1",
              severity: "INFO",
              category: "VISIT",
              title: "Nova visita agendada",
              body: "Cliente adicionado à rotina.",
              link: null,
              relatedEntityType: null,
              relatedEntityId: null,
              isRead: false,
              readAt: null,
              createdAt: "2026-06-22T10:00:00Z",
            },
          },
        ],
        totalCount: 1,
      },
    }),
    MarkAllNotificationsAsRead: () => ({
      markAllNotificationsAsRead: { status: true, message: "ok" },
    }),
  });

  await page.goto("/dashboard");

  await page.getByRole("button", { name: "Notificações" }).click();
  await page.getByText("Marcar todas").click();

  await expect(
    page.getByText("Todas as notificações marcadas como lidas")
  ).toBeVisible();
});
