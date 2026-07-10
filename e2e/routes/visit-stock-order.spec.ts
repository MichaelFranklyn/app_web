import { getCurrentWeekMondayIso } from "@/utils/format/date";
import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Estoque da visita → pedido. O vendedor pergunta o estoque fábrica por fábrica e,
 * ao descobrir que um produto vai acabar, lança o pedido daquela fábrica sem sair
 * da visita. O pedido carrega a visita de origem (`visitScheduleItemId`), que é o
 * que responde depois se a visita sugerida pelo score vendeu.
 */
const WEEK_START = getCurrentWeekMondayIso();

const scheduleConfig = () => ({
  visit_schedule_configs: {
    edges: [{ node: { id: "cfg-1", sellerId: "s-1", maxVisitsPerDay: 8 } }],
  },
});

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

// Três fábricas do vendedor para este cliente: a que motivou a visita, uma que ele
// aproveita para tratar, e uma em que o cliente nunca comprou. Todas aparecem — na
// loja ele conversa sobre o catálogo inteiro.
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
    {
      sellerClientFactoryId: "scf-2",
      sellerId: "s-1",
      clientId: "c-1",
      isFocus: false,
      source: "TRACKED",
      lastOrderDate: null,
      factory: {
        id: "f-2",
        nomeFantasia: "Fábrica Beta",
        razaoSocial: "Beta LTDA",
      },
      products: [{ id: "p-2", name: "Areia Fina", sku: "SKU-2" }],
    },
    {
      sellerClientFactoryId: "scf-3",
      sellerId: "s-1",
      clientId: "c-1",
      isFocus: false,
      source: "NO_PRODUCTS",
      lastOrderDate: null,
      factory: {
        id: "f-3",
        nomeFantasia: "Fábrica Gama",
        razaoSocial: "Gama LTDA",
      },
      products: [],
    },
  ],
});

async function openStockModal(page: import("@playwright/test").Page) {
  await page.goto("/routines");

  // Kebab DENTRO do card da visita (mesmo padrão de `routines.spec.ts`).
  // O card exibe a RAZÃO SOCIAL (`clientDisplayName`), não o nome fantasia.
  const card = page.getByRole("button", { name: /Cliente LTDA/ });
  await card.locator('[aria-haspopup="menu"]').click();
  await page.getByRole("menuitem", { name: "Estoque do cliente" }).click();
}

test("visita/estoque: todas as fábricas do vendedor aparecem, e a do foco já abre", async ({
  page,
}) => {
  await mockGraphql(page, {
    RoutineSellersOptions: () => ({ routine_sellers: { edges: [] } }),
    VisitSchedules: schedules,
    VisitScheduleConfig: scheduleConfig,
    VisitStockCandidates: candidates,
    VisitStockObservations: () => ({ visitStockObservations: { edges: [] } }),
  });

  await openStockModal(page);

  // Escopado ao modal: o nome da fábrica também aparece no card da visita atrás.
  const modal = page.getByLabel("Estoque · Cliente LTDA");

  await expect(modal.getByText("Motivo da visita")).toBeVisible();
  await expect(
    modal.getByRole("button", { name: /produtos de Fábrica Alfa/ })
  ).toBeVisible();
  await expect(
    modal.getByRole("button", { name: /produtos de Fábrica Beta/ })
  ).toBeVisible();
  // Nunca comprou desta: aparece mesmo sem produto, para o vendedor abrir a venda.
  await expect(modal.getByText("Nenhum produto para observar")).toBeVisible();

  // A fábrica do foco já vem com a aba aberta e os produtos à mão.
  await expect(modal.getByText("Cimento Forte")).toBeVisible();
  // A de fora do foco não abriu sozinha.
  await expect(modal.getByText("Areia Fina")).toHaveCount(0);
});

test("visita/estoque: abrir o card de outra fábrica acrescenta a aba dela", async ({
  page,
}) => {
  await mockGraphql(page, {
    RoutineSellersOptions: () => ({ routine_sellers: { edges: [] } }),
    VisitSchedules: schedules,
    VisitScheduleConfig: scheduleConfig,
    VisitStockCandidates: candidates,
    VisitStockObservations: () => ({ visitStockObservations: { edges: [] } }),
  });

  await openStockModal(page);
  const modal = page.getByLabel("Estoque · Cliente LTDA");

  await modal.getByRole("button", { name: /produtos de Fábrica Beta/ }).click();

  // A aba nova mostra os produtos da Beta; a aba da Alfa continua aberta.
  await expect(modal.getByText("Areia Fina")).toBeVisible();
  await expect(modal.getByRole("tab", { name: "Fábrica Alfa" })).toBeVisible();
  await expect(modal.getByRole("tab", { name: "Fábrica Beta" })).toBeVisible();
});

test("visita/estoque: o pedido lançado carrega a fábrica e a visita de origem", async ({
  page,
}) => {
  let orderInput: Record<string, unknown> | null = null;

  await mockGraphql(page, {
    RoutineSellersOptions: () => ({ routine_sellers: { edges: [] } }),
    VisitSchedules: schedules,
    VisitScheduleConfig: scheduleConfig,
    VisitStockCandidates: candidates,
    VisitStockObservations: () => ({ visitStockObservations: { edges: [] } }),
    CreateVisitOrder: (variables) => {
      orderInput = variables.input as Record<string, unknown>;
      return {
        createOrder: {
          status: true,
          message: "ok",
          data: { id: "order-novo" },
        },
      };
    },
  });

  await openStockModal(page);
  const stockModal = page.getByLabel("Estoque · Cliente LTDA");

  // Fábrica Beta, fora do foco: o vendedor foi por causa da Alfa mas vende da
  // Beta. É o caso que o vínculo por fábrica única não cobria.
  await stockModal
    .getByRole("button", { name: /produtos de Fábrica Beta/ })
    .click();
  await stockModal.getByRole("button", { name: "Lançar pedido" }).click();

  // Um modal de cada vez: o estoque some para o pedido aparecer.
  await expect(
    page.getByRole("heading", { name: "Novo pedido" })
  ).toBeVisible();
  await expect(stockModal).toHaveCount(0);

  await page.getByRole("button", { name: "Criar pedido" }).click();

  await expect.poll(() => orderInput).not.toBeNull();

  expect(orderInput).toMatchObject({
    sellerId: "s-1",
    clientId: "c-1",
    factoryId: "f-2",
    visitScheduleItemId: "it-1",
  });
});

/**
 * O vendedor também registra o estoque depois, pelo histórico de visitas do
 * cliente. É a mesma tela: precisa listar TODAS as fábricas que ele atende para
 * este cliente, não só a que motivou aquela ida.
 */
const clientLayout = () => ({
  CompanyClient: () => ({
    companyClient: {
      status: true,
      code: 200,
      message: "ok",
      data: {
        id: "cc-1",
        notes: null,
        isActive: true,
        topVisitScore: null,
        factoryVisitScores: [],
        client: {
          id: "c-1",
          cnpj: "12345678000199",
          razaoSocial: "Cliente LTDA",
          nomeFantasia: "Meu Cliente",
          cnae: "4744099",
          cnaeDescription: null,
          addressStreet: null,
          addressNumber: null,
          addressComplement: null,
          addressNeighborhood: null,
          addressZip: null,
          addressCity: null,
          addressState: null,
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
      },
    },
  }),
});

test("cliente/visitas: registrar o estoque lista todas as fábricas do vendedor", async ({
  page,
}) => {
  await mockGraphql(page, {
    ...clientLayout(),
    VisitsByCompanyClient: () => ({
      visitsByCompanyClient: {
        edges: [
          {
            node: {
              id: "it-1",
              status: "COMPLETED",
              outcome: null,
              outcomeReason: null,
              actualVisitAt: null,
              notes: null,
              focusFactories: [],
              treatedFactories: [],
              day: { id: "d-1", date: WEEK_START, schedule: null },
              clientFactoryLink: {
                id: "cfl-1",
                client: {
                  id: "c-1",
                  nomeFantasia: "Meu Cliente",
                  razaoSocial: "Cliente LTDA",
                },
                factory: {
                  id: "f-1",
                  nomeFantasia: "Fábrica Alfa",
                  razaoSocial: "Alfa LTDA",
                },
              },
            },
          },
        ],
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: 1,
      },
    }),
    VisitStockCandidates: candidates,
    VisitStockObservations: () => ({ visitStockObservations: { edges: [] } }),
  });

  await page.goto("/clients/cc-1/visits");
  await page
    .getByRole("button", { name: "Registrar estoque da visita" })
    .click();

  const modal = page.getByLabel("Estoque · Cliente LTDA");
  await expect(
    modal.getByRole("button", { name: /produtos de Fábrica Alfa/ })
  ).toBeVisible();
  await expect(
    modal.getByRole("button", { name: /produtos de Fábrica Beta/ })
  ).toBeVisible();
  await expect(
    modal.getByRole("button", { name: /produtos de Fábrica Gama/ })
  ).toBeVisible();
});

test("visita/estoque: cancelar o pedido devolve o vendedor ao estoque", async ({
  page,
}) => {
  await mockGraphql(page, {
    RoutineSellersOptions: () => ({ routine_sellers: { edges: [] } }),
    VisitSchedules: schedules,
    VisitScheduleConfig: scheduleConfig,
    VisitStockCandidates: candidates,
    VisitStockObservations: () => ({ visitStockObservations: { edges: [] } }),
  });

  await openStockModal(page);
  const stockModal = page.getByLabel("Estoque · Cliente LTDA");

  await stockModal.getByRole("button", { name: "Lançar pedido" }).click();
  await expect(
    page.getByRole("heading", { name: "Novo pedido" })
  ).toBeVisible();

  await page.getByRole("button", { name: "Cancelar" }).click();

  await expect(stockModal).toBeVisible();
  await expect(page.getByRole("heading", { name: "Novo pedido" })).toHaveCount(
    0
  );
});
