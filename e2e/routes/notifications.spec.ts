import { expect, test } from "../support/fixtures";
import { emptyDashboardQueries, mockGraphql } from "../support/graphql";

/**
 * O sino da topbar, presente em toda página interna.
 *
 * Ele guarda o que já aconteceu; o que ainda precisa ser feito mora em
 * /insights, e é para lá que o rodapé do sino aponta.
 */
const notification = (over: Record<string, unknown> = {}) => ({
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
  ...over,
});

const conn = (nodes: Array<Record<string, unknown>>) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
  totalCount: nodes.length,
});

test("notificações: marca todas como lidas", async ({ page }) => {
  await mockGraphql(page, {
    ...emptyDashboardQueries,
    MyUnreadNotificationsCount: () => ({
      myUnreadNotificationsCount: { status: true, data: 1 },
    }),
    MyNotifications: () => ({ my_notifications: conn([notification()]) }),
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

test("notificações: o sino aponta para os insights", async ({ page }) => {
  await mockGraphql(page, {
    ...emptyDashboardQueries,
    MyUnreadNotificationsCount: () => ({
      myUnreadNotificationsCount: { status: true, data: 1 },
    }),
    MyNotifications: () => ({ my_notifications: conn([notification()]) }),
    MyInsights: () => ({
      myInsights: {
        status: true,
        message: "ok",
        data: { generatedAt: "2026-08-24T10:00:00Z", insights: [] },
      },
    }),
  });

  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Notificações" }).click();
  // A saída do sino é a AÇÃO: o histórico fica ali mesmo, a pendência tem tela.
  await page.getByRole("link", { name: "Ver o que está pendente" }).click();

  await expect(
    page.getByRole("heading", { name: "Insights", level: 1 })
  ).toBeVisible();
});
