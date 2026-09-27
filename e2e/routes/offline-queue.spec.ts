import type { Page } from "@playwright/test";

import { getCurrentWeekMondayIso } from "@/utils/format/date";
import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Visita e estoque registrados sem sinal (`@/services/offlineQueue`).
 *
 * O cenário é o da loja: a rotina já está aberta, o sinal cai, o vendedor marca
 * a visita e o estoque. Nada se perde — fica no aparelho, a tela mostra que
 * está esperando, e quando o servidor volta a responder a fila envia sozinha,
 * com a HORA DO TOQUE (não a do envio).
 */
const WEEK_START = getCurrentWeekMondayIso();

const schedules = () => ({
  visit_schedules: {
    edges: [
      {
        node: {
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
              departureAddress: null,
              routeDistanceKm: "50.0",
              routeDurationMin: 120,
              items: [
                {
                  id: "it-1",
                  plannedOrder: 1,
                  contactType: "IN_PERSON",
                  estimatedTravelMin: 15,
                  status: "PENDING",
                  outcome: null,
                  notes: null,
                  focusFactories: [],
                  treatedFactories: [],
                  clientFactoryLink: {
                    id: "cfl-1",
                    latestVisitScore: null,
                    client: {
                      id: "c-1",
                      razaoSocial: "Cliente LTDA",
                      nomeFantasia: "Meu Cliente",
                      companyClient: { id: "cc-1" },
                      primaryContact: null,
                    },
                    factory: {
                      id: "f-1",
                      razaoSocial: "Alfa LTDA",
                      nomeFantasia: "Fábrica Alfa",
                    },
                  },
                },
              ],
            },
          ],
        },
      },
    ],
    pageInfo: { hasNextPage: false, endCursor: null },
    totalCount: 1,
  },
});

const candidates = () => ({
  visitStockCandidates: [
    {
      sellerClientFactoryId: "scf-1",
      sellerId: "s-1",
      clientId: "c-1",
      isFocus: true,
      source: "LAST_ORDER",
      lastOrderDate: "2026-06-01",
      factory: {
        id: "f-1",
        nomeFantasia: "Fábrica Alfa",
        razaoSocial: "Alfa LTDA",
      },
      products: [{ id: "p-1", name: "Cimento Forte", sku: "SKU-1" }],
    },
  ],
});

const baseMocks = {
  RoutineSellersOptions: () => ({ routine_sellers: { edges: [] } }),
  VisitSchedules: schedules,
  VisitScheduleConfig: () => ({
    visit_schedule_configs: {
      edges: [{ node: { id: "cfg-1", sellerId: "s-1", maxVisitsPerDay: 8 } }],
    },
  }),
  VisitStockCandidates: candidates,
  VisitStockObservations: () => ({ visitStockObservations: { edges: [] } }),
};

const OK = { status: true, message: "ok" };

/**
 * Derruba e religa a "rede" das gravações e da sondagem. As leituras seguem de
 * pé: a tela já estava carregada quando o sinal caiu — é o caso real.
 */
async function controlNetwork(page: Page) {
  const state = { down: false };
  const WRITES = new Set([
    "UpdateVisitScheduleItem",
    "SaveVisitStockObservations",
    "OfflineUpdateVisitStatus",
    "OfflineSaveStockObservations",
  ]);
  // Registrada DEPOIS do mockGraphql: o Playwright consulta a rota mais nova
  // primeiro, e `fallback` devolve ao mock o que não for derrubado.
  await page.route("**/graphql", async (route) => {
    const op = (route.request().postDataJSON() as { operationName?: string })
      ?.operationName;
    if (state.down && op && WRITES.has(op)) return route.abort();
    return route.fallback();
  });
  await page.route("**/manifest.webmanifest", async (route) => {
    if (state.down) return route.abort();
    return route.fulfill({ status: 200, body: "{}" });
  });
  return state;
}

/**
 * O `input` do checkbox é `sr-only` e o desenho fica por cima dele — o clique
 * de verdade cai no desenho. O evento vai direto ao input, como o do leitor de
 * tela.
 */
async function concludeVisit(page: Page, card: ReturnType<Page["getByRole"]>) {
  await card
    .getByRole("checkbox", { name: /como concluída/ })
    .dispatchEvent("click");
  // Concluir abre a pergunta de próximos passos (estoque/pedido) — é o fluxo
  // de sempre, com ou sem sinal. Fechada, a tela de trás volta a ser lida.
  const prompt = page.getByRole("dialog", { name: "Visita concluída" });
  await expect(prompt).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(prompt).toHaveCount(0);
}

/** O sistema avisa que a rede voltou — o gatilho que o celular dá de graça. */
const signalBack = (page: Page) =>
  page.evaluate(() => window.dispatchEvent(new Event("online")));

test("sem sinal, concluir a visita fica guardado e vai sozinho quando o sinal volta", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    ...baseMocks,
    OfflineUpdateVisitStatus: () => ({
      updateVisitScheduleItem: {
        ...OK,
        data: { id: "it-1", status: "COMPLETED" },
      },
    }),
  });
  const network = await controlNetwork(page);

  await page.goto("/routines");
  const card = page.getByRole("button", { name: /Cliente LTDA/ });
  await expect(card).toBeVisible();

  network.down = true;
  const tappedAt = Date.now();
  await concludeVisit(page, card);

  // A pessoa sabe que não perdeu nada e que não precisa marcar de novo.
  await expect(
    page.getByText(/Sem sinal: visita guardada no aparelho/)
  ).toBeVisible();
  await expect(card.getByText("Realizada · aguardando sinal")).toBeVisible();
  await expect(page.getByTestId("offline-queue-banner")).toContainText(
    "1 registro"
  );

  network.down = false;
  await signalBack(page);

  const sent = await spy.waitForCall("OfflineUpdateVisitStatus");
  expect(sent.id).toBe("it-1");
  const input = sent.input as { status: string; actualVisitAt: string };
  expect(input.status).toBe("COMPLETED");
  // A hora da visita é a do toque, não a do envio.
  expect(
    Math.abs(new Date(input.actualVisitAt).getTime() - tappedAt)
  ).toBeLessThan(10_000);

  await expect(page.getByTestId("offline-queue-banner")).toHaveCount(0);
  await expect(
    page.getByText(/1 registro enviado para o sistema/)
  ).toBeVisible();
});

test("sem sinal, o estoque fica guardado e chega com o dia em que foi visto", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    ...baseMocks,
    OfflineSaveStockObservations: () => ({
      saveVisitStockObservations: OK,
    }),
    OfflineUpdateVisitStatus: () => ({
      updateVisitScheduleItem: {
        ...OK,
        data: { id: "it-1", status: "COMPLETED" },
      },
    }),
  });
  const network = await controlNetwork(page);

  await page.goto("/routines");
  const card = page.getByRole("button", { name: /Cliente LTDA/ });
  await card.locator('[aria-haspopup="menu"]').click();
  await page.getByRole("menuitem", { name: "Estoque do cliente" }).click();
  const modal = page.getByLabel("Estoque · Cliente LTDA");
  await expect(modal.getByText("Cimento Forte")).toBeVisible();

  network.down = true;
  await modal.getByRole("button", { name: "Já acabou" }).first().click();
  await modal.getByRole("button", { name: /Salvar/ }).click();

  await expect(
    page.getByText(/Sem sinal: estoque guardado no aparelho/)
  ).toBeVisible();
  // Estoque grava e conclui a visita: os dois ficam esperando, na ordem.
  await expect(page.getByTestId("offline-queue-banner")).toContainText(
    "2 registros"
  );

  network.down = false;
  await signalBack(page);

  const stock = await spy.waitForCall("OfflineSaveStockObservations");
  expect(stock.itemId).toBe("it-1");
  expect(stock.observations).toEqual([{ productId: "p-1", daysRemaining: 0 }]);
  expect(stock.observedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  await spy.waitForCall("OfflineUpdateVisitStatus");
  await expect(page.getByTestId("offline-queue-banner")).toHaveCount(0);
});

test("o que o servidor recusa ao chegar fica avisado até a pessoa ler", async ({
  page,
}) => {
  await mockGraphql(page, {
    ...baseMocks,
    OfflineUpdateVisitStatus: () => ({
      updateVisitScheduleItem: {
        status: false,
        message: "Visita não encontrada.",
        data: null,
      },
    }),
  });
  const network = await controlNetwork(page);

  await page.goto("/routines");
  const card = page.getByRole("button", { name: /Cliente LTDA/ });
  await expect(card).toBeVisible();

  network.down = true;
  await concludeVisit(page, card);
  await expect(page.getByTestId("offline-queue-banner")).toBeVisible();

  network.down = false;
  await signalBack(page);

  const failures = page.getByTestId("offline-failures-banner");
  await expect(failures).toContainText("Cliente LTDA");
  await expect(failures).toContainText("Visita não encontrada");
  await expect(page.getByTestId("offline-queue-banner")).toHaveCount(0);

  await failures.getByRole("button", { name: "Entendi" }).click();
  await expect(failures).toHaveCount(0);
});
