import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

test("routines: a rotina da semana carrega sem agendamentos", async ({
  page,
}) => {
  await mockGraphql(page, {
    RoutineSellersOptions: () => ({ routine_sellers: { edges: [] } }),
    VisitSchedules: () => ({ visit_schedules: emptyConnection() }),
  });

  await page.goto("/routines");

  await expect(page.getByText(/07.*Rotina/)).toBeVisible();
});

/**
 * Lote 5 — rotina da semana (/routines). Mock VisitSchedules com 1 visita
 * acionável; o item tem um menu (MoreOptions) → "Editar visita". O EditVisitModal
 * tem status prefilled, então só alteramos as notas (evita o select de status).
 */
const schedule = {
  id: "sch-1",
  weekStart: "2026-06-22",
  status: "CONFIRMED",
  generatedAt: "2026-06-22T00:00:00Z",
  seller: { id: "s-1", user: { name: "João Vendedor" } },
  days: [
    {
      id: "d-1",
      date: "2026-06-22",
      status: "PLANNED",
      departureType: "HOME",
      routeDistanceKm: "50.0",
      routeDurationMin: 120,
      items: [
        {
          id: "it-1",
          plannedOrder: 1,
          estimatedTravelMin: 15,
          status: "PENDING",
          outcome: null,
          stockObservation: null,
          notes: null,
          clientFactoryLink: {
            id: "cfl-1",
            client: {
              id: "c-1",
              razaoSocial: "Cliente LTDA",
              nomeFantasia: "Meu Cliente",
            },
            factory: {
              id: "f-1",
              razaoSocial: "Fábrica LTDA",
              nomeFantasia: "Fábrica",
            },
          },
        },
      ],
    },
  ],
};

test("rotina: edita uma visita (notas)", async ({ page }) => {
  await mockGraphql(page, {
    RoutineSellersOptions: () => ({ routine_sellers: { edges: [] } }),
    VisitSchedules: () => ({
      visit_schedules: {
        edges: [{ node: schedule }],
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: 1,
      },
    }),
    UpdateVisitScheduleItem: (v) => ({
      updateVisitScheduleItem: {
        status: true,
        message: "ok",
        data: { id: v.id, ...(v.input as object) },
      },
    }),
  });

  await page.goto("/routines");

  // Menu de ações do item (kebab logo após o nome do cliente no card).
  await page
    .getByText("Meu Cliente")
    .locator("xpath=following::button[1]")
    .click();
  await page.getByRole("menuitem", { name: "Editar visita" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.locator('[name="notes"]').fill("Visita confirmada por telefone");
  await dialog.getByRole("button", { name: "Salvar alterações" }).click();

  await expect(page.getByText("Visita atualizada")).toBeVisible();
});
