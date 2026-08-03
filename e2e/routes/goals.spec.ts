import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Metas do mês: a tela monta, soma os KPIs do topo e mostra a barra de cada
 * indicador por fábrica — inclusive o caso em que a fábrica vendeu sem meta
 * definida, que é o convite para o gestor combinar um número.
 */
const goalRow = (overrides: Record<string, unknown> = {}) => ({
  goalId: "goal-1",
  sellerId: "seller-1",
  factoryId: "factory-1",
  periodMonth: "2026-08-01",
  seller: { id: "seller-1", name: "Rafael Vendas" },
  factory: {
    id: "factory-1",
    nomeFantasia: "Delta",
    nickname: null,
    razaoSocial: "Delta Industria LTDA",
  },
  targetInvoicedAmount: "80000",
  targetOrderedAmount: null,
  targetPositivations: 20,
  targetVisits: 40,
  invoicedAmount: "60000",
  orderedAmount: "72000",
  positivations: 14,
  visits: 31,
  ...overrides,
});

test("metas: KPIs do mês e barras por fábrica", async ({ page }) => {
  await mockGraphql(page, {
    SellerGoals: () => ({
      sellerGoals: {
        periodMonth: "2026-08-01",
        rows: [
          goalRow(),
          goalRow({
            goalId: null,
            factoryId: "factory-2",
            factory: {
              id: "factory-2",
              nomeFantasia: "Herc",
              nickname: null,
              razaoSocial: "Herc SA",
            },
            targetInvoicedAmount: null,
            targetPositivations: null,
            targetVisits: null,
            invoicedAmount: "5000",
            orderedAmount: "5000",
            positivations: 2,
            visits: 0,
          }),
        ],
      },
    }),
  });

  await page.goto("/goals");

  await expect(
    page.getByRole("heading", { name: "Metas", level: 1 })
  ).toBeVisible();
  // 60.000 + 5.000 faturados no mês; a meta somada é só a da fábrica que tem.
  await expect(page.getByText("R$ 65.000,00")).toBeVisible();
  await expect(page.getByText("Rafael Vendas")).toBeVisible();
  await expect(page.getByText("Sem meta neste mês")).toBeVisible();
  // 60.000 de 80.000 na fábrica com meta.
  await expect(page.getByText("75% da meta").first()).toBeVisible();
});
