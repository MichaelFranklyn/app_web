import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";
import { grantRole } from "../support/role";

/**
 * Metas do mês em dois níveis.
 *
 * `/goals` compara PESSOAS: uma linha por vendedor, com o mês inteiro resumido.
 * `/goals/<vendedor>` mostra as FÁBRICAS dele, uma em cada cartão, com a ação
 * de ajustar a cota ao lado do número — a fábrica é onde ela é negociada.
 *
 * A separação em duas telas não é estética: mexer na meta abre um modal, e
 * modal dentro de modal é proibido no projeto. Enquanto o detalhe era um modal
 * sobre a lista, o botão de ajustar abria o segundo.
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

/** A segunda fábrica do mesmo vendedor: vendeu sem meta combinada. */
const semMeta = () =>
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
  });

/** Catálogos que só o gestor consulta (vendedor recebe 403 e nem pede). */
const OPTIONS = {
  GoalsSellers: () => ({
    goals_sellers: {
      edges: [
        { node: { id: "seller-1", name: "Rafael Vendas", isActive: true } },
      ],
      totalCount: 1,
    },
  }),
  GoalsFactories: () => ({ goals_factories: { edges: [], totalCount: 0 } }),
};

const overview = () => ({
  sellerGoals: { periodMonth: "2026-08-01", rows: [goalRow(), semMeta()] },
});

test("metas: KPIs do mês e uma linha por vendedor", async ({ page }) => {
  await mockGraphql(page, { SellerGoals: overview });

  await page.goto("/goals");

  await expect(
    page.getByRole("heading", { name: "Metas", level: 1 })
  ).toBeVisible();
  // 60.000 + 5.000 faturados no mês; a meta somada é só a da fábrica que tem.
  // O valor aparece duas vezes de propósito (o cartão do topo e a linha do
  // vendedor), então a asserção não pode ser um texto solto na página.
  await expect(page.getByText("R$ 65.000,00").first()).toBeVisible();

  const linha = page.getByRole("row", { name: /Rafael Vendas/ });
  await expect(linha).toBeVisible();
  await expect(linha).toContainText("2 fábricas");

  // As fábricas são o próximo nível: não poluem a comparação entre pessoas.
  await expect(page.getByText("Delta")).toHaveCount(0);
});

test("metas: clicar no vendedor abre a página dele, um cartão por fábrica", async ({
  page,
}) => {
  await mockGraphql(page, { ...OPTIONS, SellerGoals: overview });

  await page.goto("/goals");
  await page.getByRole("row", { name: /Rafael Vendas/ }).click();

  // Página própria, com o mês na URL: o link pode ser mandado para alguém, e a
  // volta cai no mesmo mês de onde se saiu.
  await expect(page).toHaveURL(/\/goals\/seller-1\?month=2026-08-01$/);

  await expect(
    page.getByRole("heading", { name: "Rafael Vendas", level: 1 })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Delta" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Herc" })).toBeVisible();
  // 60.000 de 80.000 na fábrica com meta. `\s` porque o `formatMoney` usa
  // espaço NÃO separável (Intl pt-BR).
  await expect(page.getByText(/75% de R\$\s80\.000,00/)).toBeVisible();
  // E a fábrica que vendeu sem número combinado se identifica como tal.
  await expect(page.getByText("Sem meta").first()).toBeVisible();

  // Nenhum modal aberto até aqui: o detalhe é a página.
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("metas: gestor ajusta a cota de uma fábrica pelo cartão", async ({
  page,
}) => {
  await grantRole(page, "OWNER");
  await mockGraphql(page, { ...OPTIONS, SellerGoals: overview });

  await page.goto("/goals/seller-1?month=2026-08-01");

  // O lápis do cartão abre o ÚNICO modal da tela, a partir da página.
  await page.getByRole("button", { name: "Ajustar meta" }).first().click();

  await expect(
    page.getByRole("heading", { name: /meta do mês/i })
  ).toBeVisible();
  // E o formulário mostra a ordem de grandeza esperada em cada campo — quatro
  // caixas em branco não dizem se ali se digita dinheiro ou quantidade.
  await expect(page.getByPlaceholder("Ex.: 80000")).toBeVisible();
  await expect(page.getByPlaceholder("Ex.: 40")).toBeVisible();
});
