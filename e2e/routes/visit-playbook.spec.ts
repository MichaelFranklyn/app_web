import { getCurrentWeekMondayIso } from "@/utils/format/date";
import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Roteiro da visita: abaixo do "por que esta visita", o painel diz o que
 * oferecer — produtos que o cliente atrasou ou parou de comprar, a promoção
 * relâmpago que vale hoje e a reposição que ele mesmo pediu pelo portal.
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

const factory = (id: string, name: string) => ({
  id,
  razaoSocial: `${name} LTDA`,
  nomeFantasia: name,
  nickname: null,
});

const playbook = () => ({
  visitPlaybook: {
    companyClientId: "cc-1",
    factories: [
      {
        sellerClientFactoryId: "scf-1",
        isFocus: true,
        isNegative: false,
        moreOffersCount: 2,
        factory: factory("f-1", "Fábrica Alfa"),
        offers: [
          {
            productId: "p-1",
            status: "DUE",
            orderCount: 8,
            factoryOrderCount: 10,
            daysSinceLast: 40,
            lastUnits: "12.0000",
            isPromo: true,
            product: { id: "p-1", name: "Cimento Forte" },
          },
          {
            productId: "p-2",
            status: "STOPPED",
            orderCount: 3,
            factoryOrderCount: 10,
            daysSinceLast: 150,
            lastUnits: "6.0000",
            isPromo: false,
            product: { id: "p-2", name: "Argamassa AC3" },
          },
        ],
        promotion: {
          endsOn: "2099-12-31",
          productCount: 1,
          products: [
            {
              productId: "p-1",
              discountPercent: 15,
              isBoughtByClient: true,
              product: { id: "p-1", name: "Cimento Forte" },
            },
          ],
        },
        portalRequest: { orderId: "o-9", requestedOn: "2026-09-25" },
      },
      // Negativada: a fábrica não aceita pedido novo, então some do roteiro.
      {
        sellerClientFactoryId: "scf-2",
        isFocus: false,
        isNegative: true,
        moreOffersCount: 0,
        factory: factory("f-2", "Fábrica Beta"),
        offers: [],
        promotion: null,
        portalRequest: null,
      },
    ],
  },
});

async function openPanel(page: import("@playwright/test").Page) {
  await page.goto("/routines");
  const card = page.getByRole("button", { name: /Cliente LTDA/ });
  await card.locator('[aria-haspopup="menu"]').click();
  await page.getByRole("menuitem", { name: "Visualizar visita" }).click();
  return page.getByRole("dialog", { name: "Detalhes da visita" });
}

const baseMocks = {
  RoutineSellersOptions: () => ({ routine_sellers: { edges: [] } }),
  VisitSchedules: schedules,
  VisitScheduleConfig: () => ({
    visit_schedule_configs: {
      edges: [{ node: { id: "cfg-1", sellerId: "s-1", maxVisitsPerDay: 8 } }],
    },
  }),
};

test("roteiro da visita: o que oferecer, promoção e pedido do portal", async ({
  page,
}) => {
  await mockGraphql(page, { ...baseMocks, VisitPlaybook: playbook });
  const panel = await openPanel(page);

  await expect(panel.getByText("O que oferecer")).toBeVisible();
  await expect(panel.getByText("Hora de repor")).toBeVisible();
  await expect(
    panel.getByText("Levou 12 un. há 40 dias · em 8 de 10 pedidos")
  ).toBeVisible();
  await expect(panel.getByText("Parou de comprar")).toBeVisible();
  await expect(
    panel.getByText("E mais 2 produtos para oferecer nesta fábrica.")
  ).toBeVisible();

  await expect(panel.getByText("Promoção relâmpago")).toBeVisible();
  await expect(panel.getByText("15% mais barato")).toBeVisible();

  await expect(panel.getByText(/pediu reposição pelo portal/)).toBeVisible();

  // A negativada não entra: não há venda a sugerir dela.
  await expect(panel.getByText("Fábrica Beta")).toHaveCount(0);
});

test("roteiro da visita: cliente no ritmo diz isso, em vez de lista vazia", async ({
  page,
}) => {
  await mockGraphql(page, {
    ...baseMocks,
    VisitPlaybook: () => ({
      visitPlaybook: { companyClientId: "cc-1", factories: [] },
    }),
  });
  const panel = await openPanel(page);

  await expect(
    panel.getByText(/o cliente está comprando no ritmo dele/)
  ).toBeVisible();
  await expect(
    panel.getByRole("button", { name: "Ver tudo o que ele compra" })
  ).toBeVisible();
});
