import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * As quatro abas de conferência (faturamento, fábricas, situação da carteira e
 * curva ABC).
 *
 * O que estes testes prendem, além de "a tela monta": que cada uma mostra o que
 * a torna diferente das que já existiam — a duplicata VENCIDA com o atraso em
 * dias, a distância entre o colocado e o faturado por fábrica, a situação do
 * cliente medida contra o próprio ritmo e a classe da curva de Pareto.
 */
const sellers = () => ({
  edges: [{ node: { id: "seller-1", name: "Rafael Vendas" } }],
});

const installment = (overrides: Record<string, unknown> = {}) => ({
  installmentId: "inst-1",
  orderId: "order-1",
  sequence: 1,
  clientId: "client-1",
  clientName: "CASA DO SONO LTDA",
  factoryId: "factory-1",
  factoryName: "Herc",
  sellerId: "seller-1",
  sellerName: "Rafael Vendas",
  invoicedAt: "2026-06-10",
  dueDate: "2026-07-10",
  amount: "1200.00",
  commissionAmount: "36.00",
  situation: "OVERDUE",
  paidAt: null,
  daysOverdue: 26,
  isCommissionReceived: false,
  ...overrides,
});

test("faturamento: mostra a duplicata vencida e o atraso em dias", async ({
  page,
}) => {
  await mockGraphql(page, {
    DashboardSellers: () => ({ dashboard_sellers: sellers() }),
    BillingReport: () => ({
      billingReport: {
        rows: [installment()],
        installmentCount: 1,
        orderCount: 1,
        totalAmount: "1200.00",
        paidAmount: "0",
        dueAmount: "0",
        overdueAmount: "1200.00",
        overdueCount: 1,
        commissionAmount: "36.00",
      },
    }),
  });

  await page.goto("/dashboard/reports/billing");

  await expect(page.getByText("Duplicatas do período").first()).toBeVisible();
  await expect(page.getByText("CASA DO SONO LTDA")).toBeVisible();
  // O atraso escrito é o que a cobrança usa na ligação.
  await expect(page.getByText("26 dias")).toBeVisible();
  await expect(page.getByText("Vencida").first()).toBeVisible();
});

test("fábricas: uma linha por fábrica, com o que já voltou faturado", async ({
  page,
}) => {
  await mockGraphql(page, {
    DashboardSellers: () => ({ dashboard_sellers: sellers() }),
    FactoryOrdersReport: () => ({
      factoryOrdersReport: [
        {
          entityId: "factory-1",
          entityName: "Herc",
          orderCount: 10,
          totalAmount: "48200.00",
          avgTicket: "4820.00",
          clientCount: 6,
          invoicedCount: 6,
          invoicedAmount: "24100.00",
          commissionAmount: "1446.00",
          lastOrderDate: "2026-07-20",
          share: 0.8,
        },
      ],
    }),
  });

  await page.goto("/dashboard/reports/factories");

  await expect(page.getByText("Fábricas do período").first()).toBeVisible();
  await expect(page.getByRole("cell", { name: "Herc" })).toBeVisible();
  // Metade do que foi colocado já voltou faturado: é a leitura da coluna.
  await expect(page.getByText("50%").first()).toBeVisible();
});

test("carteira: classifica o cliente contra o próprio ritmo", async ({
  page,
}) => {
  await mockGraphql(page, {
    DashboardSellers: () => ({ dashboard_sellers: sellers() }),
    WalletStatusReport: () => ({
      walletStatusReport: {
        rows: [
          {
            clientId: "client-1",
            companyClientId: "cc-1",
            clientName: "MÓVEIS NORTE",
            city: "Salvador",
            state: "BA",
            situation: "AT_RISK",
            lastOrderDate: "2026-05-01",
            daysSinceLastOrder: 96,
            avgIntervalDays: 60,
            riskRatio: 1.6,
            orderCount: 4,
            periodOrderCount: 0,
            periodAmount: "0",
          },
          {
            clientId: "client-2",
            companyClientId: "cc-2",
            clientName: "CASA NOVA",
            city: null,
            state: null,
            situation: "NEVER",
            lastOrderDate: null,
            daysSinceLastOrder: null,
            avgIntervalDays: null,
            riskRatio: null,
            orderCount: 0,
            periodOrderCount: 0,
            periodAmount: "0",
          },
        ],
        totalClients: 2,
        activeClients: 0,
        atRiskClients: 1,
        inactiveClients: 0,
        neverBoughtClients: 1,
        newClients: 0,
        periodAmount: "0",
      },
    }),
  });

  await page.goto("/dashboard/reports/wallet");

  await expect(page.getByText("Clientes da carteira").first()).toBeVisible();
  await expect(page.getByText("MÓVEIS NORTE")).toBeVisible();
  await expect(page.getByText("Atrasado").first()).toBeVisible();
  // 96 dias parados sobre um ritmo de 60 dias.
  await expect(page.getByText("1.6×")).toBeVisible();
  // Quem nunca comprou não recebe "0 dias", que seria lido como "comprou hoje".
  await expect(page.getByText("nunca comprou").first()).toBeVisible();
});

test("curva ABC: classe e acumulado por cliente", async ({ page }) => {
  await mockGraphql(page, {
    DashboardSellers: () => ({ dashboard_sellers: sellers() }),
    ClientAbcCurve: () => ({
      clientAbcCurve: [
        {
          clientId: "client-1",
          clientName: "TENDTUDO VALERIA",
          rank: 1,
          totalAmount: "80000.00",
          orderCount: 12,
          commissionAmount: "2400.00",
          share: 0.8,
          cumulativeShare: 0.8,
          abcClass: "A",
          lastOrderDate: "2026-07-18",
        },
        {
          clientId: "client-2",
          clientName: "PERIPERI CONSTRUCAO",
          rank: 2,
          totalAmount: "20000.00",
          orderCount: 3,
          commissionAmount: "600.00",
          share: 0.2,
          cumulativeShare: 1,
          abcClass: "B",
          lastOrderDate: "2026-07-02",
        },
      ],
    }),
  });

  await page.goto("/dashboard/reports/abc");

  await expect(
    page.getByText("Clientes por faturamento").first()
  ).toBeVisible();
  await expect(page.getByText("TENDTUDO VALERIA")).toBeVisible();
  // O acumulado da última linha fecha em 100%: é o que prova que a curva
  // cobre a carteira inteira, sem "outros" escondido.
  await expect(page.getByRole("cell", { name: "100%" })).toBeVisible();
});

test("o recorte sobrevive à troca para as abas novas", async ({ page }) => {
  const spy = await mockGraphql(page, {
    DashboardSellers: () => ({ dashboard_sellers: sellers() }),
    ClientAbcCurve: () => ({ clientAbcCurve: [] }),
    WalletStatusReport: () => ({
      walletStatusReport: {
        rows: [],
        totalClients: 0,
        activeClients: 0,
        atRiskClients: 0,
        inactiveClients: 0,
        neverBoughtClients: 0,
        newClients: 0,
        periodAmount: "0",
      },
    }),
  });

  await page.goto(
    "/dashboard/reports/abc?from=2026-05-01&to=2026-05-31&seller=seller-1"
  );
  await expect(
    page.getByText("Clientes por faturamento").first()
  ).toBeVisible();

  await page.getByRole("link", { name: "Situação da carteira" }).click();

  await expect(page).toHaveURL(/from=2026-05-01/);
  const variables = await spy.waitForCall("WalletStatusReport");
  const sent = JSON.stringify(variables);
  expect(sent).toContain("2026-05-01");
  expect(sent).toContain("seller-1");
});
