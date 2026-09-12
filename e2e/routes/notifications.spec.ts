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

/**
 * O convite para receber os avisos no aparelho mora no rodapé do sino — é onde
 * a pessoa já está pensando em notificação. Ele existe só para quem PODE ativar:
 * sem chave VAPID no servidor, o sino não convida ninguém.
 */
test("notificações: o sino convida a receber os avisos no aparelho", async ({
  page,
}) => {
  // O Chromium headless nasce com as notificações negadas (e nem
  // `grantPermissions` muda isso) — o convite não apareceria para um navegador
  // que já bloqueou. Fingir a resposta põe a tela no estado de quem pode ativar.
  await page.addInitScript(() => {
    Object.defineProperty(Notification, "permission", {
      configurable: true,
      get: () => "default",
    });
  });

  await mockGraphql(page, {
    ...emptyDashboardQueries,
    MyUnreadNotificationsCount: () => ({
      myUnreadNotificationsCount: { status: true, data: 1 },
    }),
    MyNotifications: () => ({ my_notifications: conn([notification()]) }),
    PushPublicKey: () => ({
      pushPublicKey: { status: true, data: "BEl62iUYgUivxIkv69yViEuiBIa40HI" },
    }),
  });

  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Notificações" }).click();

  await expect(page.getByText("Receber estes avisos no aparelho")).toBeVisible({
    timeout: 15000,
  });
});

test("notificações: sem chave no servidor, o sino não convida", async ({
  page,
}) => {
  await mockGraphql(page, {
    ...emptyDashboardQueries,
    MyUnreadNotificationsCount: () => ({
      myUnreadNotificationsCount: { status: true, data: 1 },
    }),
    MyNotifications: () => ({ my_notifications: conn([notification()]) }),
    PushPublicKey: () => ({ pushPublicKey: { status: true, data: "" } }),
  });

  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Notificações" }).click();

  // A notificação na lista prova que o dropdown abriu antes da negativa.
  await expect(page.getByText("Nova visita agendada")).toBeVisible();
  await expect(page.getByText("Receber estes avisos no aparelho")).toHaveCount(
    0
  );
});
