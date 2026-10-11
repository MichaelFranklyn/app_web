import type { Page } from "@playwright/test";

import { getCurrentWeekMondayIso } from "@/utils/format/date";

import { expect } from "./fixtures";

/**
 * Cenário da rotina com UMA visita pendente, e os controles de "rede" dos specs
 * de fila offline. Compartilhado por `routes/offline-queue.spec.ts` (service
 * worker desligado) e `offline-sw/*.spec.ts` (service worker ligado).
 */
export const WEEK_START = getCurrentWeekMondayIso();

export const schedules = () => ({
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

export const candidates = () => ({
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

export const baseMocks = {
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

export const OK = { status: true, message: "ok" };

/**
 * Derruba e religa a "rede" das gravações e da sondagem. As leituras seguem de
 * pé: a tela já estava carregada quando o sinal caiu — é o caso real.
 */
export async function controlNetwork(page: Page) {
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
export async function concludeVisit(
  page: Page,
  card: ReturnType<Page["getByRole"]>
) {
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
export const signalBack = (page: Page) =>
  page.evaluate(() => window.dispatchEvent(new Event("online")));
