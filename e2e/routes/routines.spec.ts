import { getCurrentWeekMondayIso } from "@/utils/format/date";
import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

// `useRoutines` lê `visit_schedule_configs.edges[0]` — o campo é não-nulo no
// schema, então sem handler o fallback `{}` derruba a página inteira.
const scheduleConfig = () => ({
  visit_schedule_configs: {
    edges: [{ node: { id: "cfg-1", sellerId: "s-1", maxVisitsPerDay: 8 } }],
  },
});

test("routines: a rotina da semana carrega sem agendamentos", async ({
  page,
}) => {
  await mockGraphql(page, {
    RoutineSellersOptions: () => ({ routine_sellers: { edges: [] } }),
    VisitSchedules: () => ({ visit_schedules: emptyConnection() }),
    VisitScheduleConfig: scheduleConfig,
  });

  await page.goto("/routines");

  await expect(page.getByText(/07.*Rotina/)).toBeVisible();
});

/**
 * Lote 5 — rotina da semana (/routines). Mock VisitSchedules com 1 visita
 * acionável; o item tem um menu (MoreOptions) → "Editar visita". O EditVisitModal
 * tem status prefilled, então só alteramos as notas (evita o select de status).
 */
// A grade sempre monta a SEMANA CORRENTE (`getCurrentWeekMondayIso`) e casa os
// `days` por data. Uma data fixa aqui só funciona na semana em que foi escrita —
// depois o item cai fora da grade e o card não renderiza. Ancorar em "hoje".
const WEEK_START = getCurrentWeekMondayIso();

const schedule = {
  id: "sch-1",
  weekStart: WEEK_START,
  status: "CONFIRMED",
  generatedAt: `${WEEK_START}T00:00:00Z`,
  seller: { id: "s-1", user: { name: "João Vendedor" } },
  days: [
    {
      id: "d-1",
      date: WEEK_START,
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
          notes: null,
          focusFactories: [],
          treatedFactories: [],
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
    VisitScheduleConfig: scheduleConfig,
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

  // Kebab DENTRO do card da visita. O `following::button[1]` era ambíguo: o
  // card virou role="button" e há outros botões depois dele no DOM.
  // O card exibe a RAZÃO SOCIAL (`clientDisplayName`), não o nome fantasia.
  const card = page.getByRole("button", { name: /Cliente LTDA/ });
  await card.locator('[aria-haspopup="menu"]').click();
  await page.getByRole("menuitem", { name: "Editar visita" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.locator('[name="notes"]').fill("Visita confirmada por telefone");
  await dialog.getByRole("button", { name: "Salvar alterações" }).click();

  await expect(page.getByText("Visita atualizada")).toBeVisible();
});
