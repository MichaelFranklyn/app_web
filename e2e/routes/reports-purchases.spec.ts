import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * A aba "Últimas compras" (/dashboard/reports/purchases).
 *
 * O que estes testes prendem, além de "a tela monta": que a linha é o PAR
 * cliente×fábrica — o mesmo cliente aparece uma vez por fábrica, em dia numa e
 * parado na outra —, que o par cadastrado e nunca comprado não é confundido com
 * "comprou hoje", e que ordenar por uma coluna reordena a lista de verdade (é o
 * mesmo recorte que vai para o arquivo exportado).
 */
const sellers = () => ({
  edges: [{ node: { id: "seller-1", name: "Rafael Vendas" } }],
});

const row = (overrides: Record<string, unknown> = {}) => ({
  clientId: "client-1",
  companyClientId: "cc-1",
  clientName: "CASA DO SONO LTDA",
  city: "Salvador",
  state: "BA",
  factoryId: "factory-1",
  factoryName: "Herc",
  sellerName: "Rafael Vendas",
  isLinked: true,
  situation: "ACTIVE",
  lastOrderId: "aabbccdd-1111-2222-3333-444455556666",
  lastOrderDate: "2026-07-30",
  lastOrderAmount: "5389.31",
  lastOrderStatus: "CONFIRMED",
  lastInvoicedAt: null,
  daysSinceLastOrder: 7,
  avgIntervalDays: 30,
  riskRatio: 0.23,
  orderCount: 4,
  historyAmount: "20000.00",
  periodOrderCount: 1,
  periodAmount: "5389.31",
  ...overrides,
});

const report = (rows: Record<string, unknown>[]) => ({
  clientFactoryPurchasesReport: {
    rows,
    totalRows: rows.length,
    clientCount: 1,
    factoryCount: 2,
    neverBoughtRows: rows.filter((r) => r.situation === "NEVER").length,
    atRiskRows: rows.filter((r) => r.situation === "AT_RISK").length,
    inactiveRows: rows.filter((r) => r.situation === "INACTIVE").length,
    periodOrderCount: 1,
    periodAmount: "5389.31",
  },
});

test("o mesmo cliente aparece uma vez por fábrica, com a situação de cada uma", async ({
  page,
}) => {
  await mockGraphql(page, {
    DashboardSellers: () => ({ dashboard_sellers: sellers() }),
    ClientFactoryPurchasesReport: () =>
      report([
        row(),
        row({
          factoryId: "factory-2",
          factoryName: "Delta",
          situation: "INACTIVE",
          lastOrderDate: "2025-11-20",
          daysSinceLastOrder: 259,
          avgIntervalDays: 45,
          riskRatio: 5.8,
          periodOrderCount: 0,
          periodAmount: "0",
        }),
      ]),
  });

  await page.goto("/dashboard/reports/purchases");

  await expect(
    page.getByRole("heading", { name: /Última compra por fábrica/ })
  ).toBeVisible();
  // A mesma razão social nas duas linhas, uma por fábrica.
  await expect(
    page.getByRole("cell", { name: "CASA DO SONO LTDA" })
  ).toHaveCount(2);
  await expect(page.getByRole("cell", { name: "Herc" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Delta" })).toBeVisible();
  // Em dia numa fábrica e parado na outra: é o que a aba existe para mostrar.
  await expect(page.getByText("Em dia").first()).toBeVisible();
  await expect(page.getByText("Parado").first()).toBeVisible();
  await expect(page.getByText("há 259 dias")).toBeVisible();
});

test("par cadastrado que nunca comprou daquela fábrica", async ({ page }) => {
  await mockGraphql(page, {
    DashboardSellers: () => ({ dashboard_sellers: sellers() }),
    ClientFactoryPurchasesReport: () =>
      report([
        row({
          factoryId: "factory-2",
          factoryName: "Delta",
          situation: "NEVER",
          lastOrderId: null,
          lastOrderDate: null,
          lastOrderAmount: "0",
          lastOrderStatus: null,
          daysSinceLastOrder: null,
          avgIntervalDays: null,
          riskRatio: null,
          orderCount: 0,
          historyAmount: "0",
          periodOrderCount: 0,
          periodAmount: "0",
        }),
      ]),
  });

  await page.goto("/dashboard/reports/purchases");

  // Nem "0 dias" (que seria lido como "comprou hoje") nem célula vazia.
  await expect(page.getByText("nunca comprou desta fábrica")).toBeVisible();
  await expect(page.getByText("Nunca comprou").first()).toBeVisible();
});

test("o painel de filtros recorta por situação", async ({ page }) => {
  await mockGraphql(page, {
    DashboardSellers: () => ({ dashboard_sellers: sellers() }),
    ClientFactoryPurchasesReport: () =>
      report([
        row({ clientName: "ALFA MATERIAIS" }),
        row({
          clientId: "client-2",
          companyClientId: "cc-2",
          clientName: "ZETA CONSTRUCOES",
          situation: "INACTIVE",
          daysSinceLastOrder: 200,
        }),
      ]),
  });

  await page.goto("/dashboard/reports/purchases");
  await expect(page.getByText("ALFA MATERIAIS")).toBeVisible();

  await page.getByRole("button", { name: "Filtros" }).click();
  const situacao = page
    .locator("[data-filters-panel]")
    .getByPlaceholder("Todas as situações");
  await situacao.click();
  await page
    .locator("[data-select-dropdown]")
    .getByText("Parado", { exact: true })
    .click();

  // O recorte é em memória (o relatório vem inteiro): a linha em dia sai da
  // tabela sem nova ida ao backend.
  await expect(page.getByText("ALFA MATERIAIS")).toHaveCount(0);
  await expect(page.getByText("ZETA CONSTRUCOES")).toBeVisible();
  await expect(page.getByRole("button", { name: "Filtros (1)" })).toBeVisible();
});

test("ordenar por uma coluna reordena a lista", async ({ page }) => {
  await mockGraphql(page, {
    DashboardSellers: () => ({ dashboard_sellers: sellers() }),
    ClientFactoryPurchasesReport: () =>
      report([
        row({ clientName: "ALFA MATERIAIS", daysSinceLastOrder: 5 }),
        row({
          clientId: "client-2",
          companyClientId: "cc-2",
          clientName: "ZETA CONSTRUCOES",
          situation: "INACTIVE",
          daysSinceLastOrder: 200,
        }),
      ]),
  });

  await page.goto("/dashboard/reports/purchases");
  await expect(page.getByText("ALFA MATERIAIS")).toBeVisible();

  // "Parado há" começa pelo maior: quem está parado há mais tempo sobe.
  await page.getByRole("button", { name: "Parado há" }).click();

  await expect(page).toHaveURL(/sortBy=idle/);
  const first = page.locator("tbody tr").first();
  await expect(first).toContainText("ZETA CONSTRUCOES");
});

test("o recorte de período e vendedor chega na consulta", async ({ page }) => {
  const spy = await mockGraphql(page, {
    DashboardSellers: () => ({ dashboard_sellers: sellers() }),
    ClientFactoryPurchasesReport: () => report([row()]),
  });

  await page.goto(
    "/dashboard/reports/purchases?from=2026-05-01&to=2026-05-31&seller=seller-1"
  );

  const variables = await spy.waitForCall("ClientFactoryPurchasesReport");
  const sent = JSON.stringify(variables);
  expect(sent).toContain("2026-05-01");
  expect(sent).toContain("seller-1");
});
