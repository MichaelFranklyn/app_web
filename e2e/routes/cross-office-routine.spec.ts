import { getCurrentWeekMondayIso, getTodayIso } from "@/utils/format/date";
import { visitPriority } from "@/utils/score";
import type { Page } from "@playwright/test";
import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";
import { grantRole } from "../support/role";

/**
 * Rotina integrada entre escritórios (16/11/2026): a mesma pessoa vende em dois
 * escritórios e, na agenda de cá, vê e conclui as paradas de lá, sem trocar.
 *
 * O que este spec protege:
 * - o cartão da parada de lá (nome, escritório, "Pedido e estoque: entre no…")
 *   e as ações dele — concluir e "Não estava" mandam só o ESTADO;
 * - o mesmo cliente nos dois vira o selo "Também no …", não um cartão a mais;
 * - a rota do dia soma os dois escritórios (`crossOfficeDayRoute`) e é refeita
 *   quando uma parada muda;
 * - um dia só com paradas de lá também tem rota;
 * - nada de percentual, comissão ou preço da fábrica de lá chega à tela.
 */

test.beforeEach(async ({ page }) => {
  await grantRole(page, "SELLER", { alsoJwt: true });
});

const TODAY = getTodayIso();
const WEEK_START = getCurrentWeekMondayIso();
const OFFICE = "Escritório Sul";

const scheduleConfig = () => ({
  visit_schedule_configs: {
    edges: [{ node: { id: "cfg-1", sellerId: "s-1", maxVisitsPerDay: 8 } }],
  },
});

const hereItem = {
  id: "it-here",
  plannedOrder: 1,
  contactType: "IN_PERSON",
  estimatedTravelMin: 15,
  status: "PENDING",
  outcome: null,
  notes: null,
  // Com score, o card mostra o selo de prioridade, e o tooltip dele avisa
  // que a mesma ida também está marcada no outro escritório.
  focusFactories: [
    {
      scoreTotal: "80.00",
      factory: {
        id: "f-1",
        nomeFantasia: "Fábrica",
        nickname: null,
        razaoSocial: "Fábrica LTDA",
      },
      clientFactoryLink: null,
    },
  ],
  treatedFactories: [],
  clientFactoryLink: {
    id: "cfl-here",
    client: {
      id: "c-shared",
      razaoSocial: "Cliente Dos Dois",
      nomeFantasia: null,
      primaryContact: null,
    },
    factory: {
      id: "f-1",
      razaoSocial: "Fábrica LTDA",
      nomeFantasia: "Fábrica",
    },
    latestVisitScore: null,
  },
};

const scheduleWith = (items: unknown[]) => ({
  visit_schedules: {
    edges: items.length
      ? [
          {
            node: {
              id: "sch-1",
              weekStart: WEEK_START,
              status: "CONFIRMED",
              generatedAt: `${WEEK_START}T00:00:00Z`,
              seller: { id: "s-1", user: { name: "João Vendedor" } },
              days: [
                {
                  id: "d-today",
                  date: TODAY,
                  status: "PLANNED",
                  departureType: "HOME",
                  routeDistanceKm: "10.0",
                  routeDurationMin: 30,
                  items,
                },
              ],
            },
          },
        ]
      : [],
    pageInfo: { hasNextPage: false, endCursor: null },
    totalCount: items.length ? 1 : 0,
  },
});

const theirStop = (over: Record<string, unknown>) => ({
  id: "x-1",
  companyId: "co-sul",
  officeName: OFFICE,
  date: TODAY,
  status: "PENDING",
  contactType: "IN_PERSON",
  plannedOrder: 1,
  isManual: false,
  outcome: null,
  clientId: "c-sul",
  clientName: "Loja Do Sul",
  city: "Campinas",
  state: "SP",
  neighborhood: "Centro",
  address: "Rua A, 10",
  factoryName: "Fábrica Sul",
  ...over,
});

/**
 * Mock com estado: a mutação muda o status da parada de lá, e a próxima
 * leitura de `crossOfficeStops` já vem com ele — como o backend.
 */
async function mockCrossOffice(page: Page, items: unknown[]) {
  const stops = [
    theirStop({}),
    // O mesmo cliente da visita daqui: vira selo, não cartão.
    theirStop({
      id: "x-shared",
      clientId: "c-shared",
      clientName: "Cliente Dos Dois",
    }),
  ];
  return mockGraphql(page, {
    RoutineSellersOptions: () => ({ routine_sellers: { edges: [] } }),
    VisitScheduleConfig: scheduleConfig,
    VisitSchedules: () => scheduleWith(items),
    CrossOfficeStops: () => ({
      crossOfficeStops: { status: true, message: "OK", data: stops },
    }),
    UpdateCrossOfficeVisit: (v) => {
      const stop = stops.find((s) => s.id === v.id)!;
      stop.status = (v.input as { status: string }).status;
      return {
        updateCrossOfficeVisit: {
          status: true,
          message: "OK",
          data: { id: stop.id, status: stop.status },
        },
      };
    },
    CrossOfficeDayRoute: () => ({
      crossOfficeDayRoute: {
        status: true,
        message: "OK",
        data: {
          distanceKm: "42.5",
          durationMin: 70,
          stopCount: 2,
          visitDurationMin: 120,
          lastEndTime: "11:20",
          departureAddress: "Rua de Casa, 1, Campinas - SP",
          order: ["it-here", "x-1"],
        },
      },
    }),
  });
}

const theirCard = (page: Page) =>
  page.locator(`[title="Da sua rotina no ${OFFICE}"]`);

test("outro escritório: cartão, selo e rota somando os dois", async ({
  page,
}) => {
  const spy = await mockCrossOffice(page, [hereItem]);
  await page.goto(`/schedule?view=day&date=${TODAY}`);

  // A parada de lá tem cartão próprio; a do mesmo cliente vira selo.
  const card = theirCard(page);
  await expect(card).toHaveCount(1);
  await expect(card.getByText("Loja Do Sul")).toBeVisible();
  // Fábrica e escritório numa linha só; o aviso de onde lançar pedido e
  // estoque vai no title dela.
  await expect(
    card.getByTitle(`Pedido e estoque desta parada: entre no ${OFFICE}.`)
  ).toHaveText(`Fábrica Sul · ${OFFICE}`);
  // A parada daqui do mesmo cliente avisa no tooltip do selo de prioridade
  // (o card não tem mais a linha "Também no …").
  await page
    .locator("[data-badge]", { hasText: visitPriority(80).label })
    .first()
    .hover();
  await expect(page.getByRole("tooltip")).toContainText(
    `Também marcada no ${OFFICE} neste dia`
  );

  // A rota é uma só: os números vêm da soma, pedida para o dia.
  expect((await spy.waitForCall("CrossOfficeDayRoute")).date).toBe(TODAY);
  await expect(page.getByText("somando os escritórios")).toBeVisible();
  await expect(page.getByText("42,5 km · 2 paradas")).toBeVisible();
  await expect(page.getByText("última termina 11:20")).toBeVisible();

  // Nada de percentual da fábrica de lá na tela.
  await expect(card.getByText(/%/)).toHaveCount(0);
});

test("outro escritório: concluir manda só o estado e refaz a rota", async ({
  page,
}) => {
  const spy = await mockCrossOffice(page, [hereItem]);
  await page.goto(`/schedule?view=day&date=${TODAY}`);
  await spy.waitForCall("CrossOfficeDayRoute");
  const routeCalls = spy.calls("CrossOfficeDayRoute").length;

  // O checkbox é sr-only (o quadradinho visual intercepta o ponteiro): o
  // clique vai no input, como no helper da rotina offline.
  await theirCard(page)
    .getByRole("checkbox", { name: "Marcar visita como concluída" })
    .dispatchEvent("click");

  await expect(page.getByText("Visita concluída.")).toBeVisible();
  expect(spy.lastVariables("UpdateCrossOfficeVisit")).toEqual({
    id: "x-1",
    input: { status: "COMPLETED" },
  });
  await expect(theirCard(page).getByLabel("Reabrir visita")).toBeChecked();
  // A parada mudou: a soma é pedida de novo.
  await expect
    .poll(() => spy.calls("CrossOfficeDayRoute").length)
    .toBeGreaterThan(routeCalls);
});

test('outro escritório: "Não estava" anota a ausência lá', async ({ page }) => {
  const spy = await mockCrossOffice(page, [hereItem]);
  await page.goto(`/schedule?view=day&date=${TODAY}`);

  await theirCard(page)
    .getByRole("button", { name: "Marcar que Loja Do Sul não estava" })
    .click();

  await expect(page.getByText("Anotado: o cliente não estava.")).toBeVisible();
  expect(spy.lastVariables("UpdateCrossOfficeVisit")).toEqual({
    id: "x-1",
    input: { status: "CLIENT_ABSENT" },
  });
});

test("outro escritório: dia só com paradas de lá também tem rota", async ({
  page,
}) => {
  await mockCrossOffice(page, []);
  await page.goto(`/schedule?view=day&date=${TODAY}`);

  // Sem dia de cá, as duas paradas de lá são cartões.
  await expect(theirCard(page)).toHaveCount(2);
  await expect(page.getByText("Distância total")).toBeVisible();
  await expect(page.getByText("42,5 km · 2 paradas")).toBeVisible();
  // A partida é do dia de cá — sem dia aqui, não há o que editar.
  await expect(page.getByText("Ponto de partida")).toHaveCount(0);
});
