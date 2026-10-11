import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";
import { grantRole } from "../support/role";

/**
 * A central de pendências: a lista de trabalho do dia.
 *
 * O que estes testes prendem é o que a tela promete a quem a abre: cada linha
 * diz a prioridade, o prazo e o MOTIVO, leva direto aonde se resolve, e o
 * filtro chega ao backend (a lista é paginada lá — filtrar a página na tela
 * mentiria sobre o total).
 */
const item = (over: Record<string, unknown> = {}) => ({
  __typename: "PendingItemType",
  id: "VISIT_UNANSWERED:v-1:seller-1",
  type: "VISIT_OVERDUE",
  reason: "VISIT_UNANSWERED",
  priority: "HIGH",
  dueDate: "2026-10-07",
  daysLate: 4,
  clientName: "Mercadinho do Zé",
  link: "/routines/2026-10-11?seller=seller-1",
  clientLink: "/clients/cc-1",
  factoryName: null,
  sellerId: "seller-1",
  sellerName: "João Sacramento",
  amount: null,
  referenceDate: "2026-10-07",
  isRemote: false,
  allowanceDays: 0,
  isEstimated: false,
  highAfterDays: 3,
  scheduledDate: null,
  ...over,
});

const order = (over: Record<string, unknown> = {}) =>
  item({
    id: "PENDING_INVOICE:o-1:seller-1",
    type: "ORDER_STALLED",
    reason: "PENDING_INVOICE",
    priority: "MEDIUM",
    dueDate: "2026-10-09",
    daysLate: 2,
    clientName: "Decore Casa",
    link: "/orders/o-1",
    factoryName: "Herc",
    amount: "1500.00",
    referenceDate: "2026-10-02",
    allowanceDays: 7,
    highAfterDays: 15,
    ...over,
  });

const comeBack = (over: Record<string, unknown> = {}) =>
  item({
    id: "RETURN_DATE:v-9:seller-1",
    type: "RETURN_SCHEDULED",
    reason: "RETURN_DATE",
    priority: "LOW",
    dueDate: "2026-10-16",
    daysLate: -5,
    clientName: "Casa Bahia Tintas",
    link: "/clients/cc-3",
    clientLink: "/clients/cc-3",
    referenceDate: "2026-09-30",
    allowanceDays: null,
    highAfterDays: 0,
    ...over,
  });

const response = (items: Array<Record<string, unknown>>) => {
  const count = (type: string) => ({
    __typename: "PendingTypeCountType",
    type,
    count: items.filter((i) => i.type === type).length,
    highCount: items.filter((i) => i.type === type && i.priority === "HIGH")
      .length,
  });
  return {
    myPendingItems: {
      __typename: "PendingItemsDataResponse",
      status: true,
      message: "ok",
      data: {
        __typename: "PendingItemsType",
        generatedAt: "2026-10-11T17:32:00Z",
        totalCount: items.length,
        counts: [
          "VISIT_OVERDUE",
          "RETURN_SCHEDULED",
          "ORDER_STALLED",
          "CLIENT_NO_CONTACT",
        ].map(count),
        items,
      },
    },
  };
};

test("pendências: cada linha traz prioridade, prazo e motivo", async ({
  page,
}) => {
  await mockGraphql(page, {
    MyPendingItems: () => response([item(), order(), comeBack()]),
  });

  await page.goto("/pending");

  const visit = page.getByRole("row").filter({ hasText: "Mercadinho do Zé" });
  await expect(visit).toContainText("Alta");
  await expect(visit).toContainText("Visita atrasada");
  // O motivo por extenso, com a data do fato.
  await expect(visit).toContainText(
    "A visita de 07/10/2026 ficou sem resposta"
  );
  await expect(visit).toContainText("venceu há 4 dias");
  await expect(visit).toContainText("Responder na rota do dia");

  const stalled = page.getByRole("row").filter({ hasText: "Decore Casa" });
  await expect(stalled).toContainText("Média");
  await expect(stalled).toContainText("a fábrica ainda não faturou");
  // A régua escrita: 7 dias de prazo + 2 de atraso = confirmado há 9 dias.
  await expect(stalled).toContainText("Confirmado em 02/10/2026, há 9 dias");
  await expect(stalled).toContainText("Prazo considerado: 7 dias");
  await expect(stalled).toContainText("Herc");

  // Retorno ainda no prazo: aparece, mas sem alarme.
  const later = page.getByRole("row").filter({ hasText: "Casa Bahia Tintas" });
  await expect(later).toContainText("Baixa");
  await expect(later).toContainText("vence em 5 dias");

  // O recorte padrão está escrito: sem isso, o retorno de daqui a dois meses
  // pareceria perdido.
  await expect(page.getByText(/vence nos próximos 7 dias/)).toBeVisible();
});

test("pendências: a linha leva direto aonde se resolve", async ({ page }) => {
  await mockGraphql(page, {
    MyPendingItems: () => response([order()]),
  });

  await page.goto("/pending");
  await page.getByRole("row").filter({ hasText: "Decore Casa" }).click();

  await expect(page).toHaveURL(/\/orders\/o-1$/);
});

test("pendências: pedido parado também abre a ficha do cliente", async ({
  page,
}) => {
  await mockGraphql(page, {
    MyPendingItems: () => response([order(), comeBack()]),
  });

  await page.goto("/pending");

  // Quando a linha JÁ leva ao cliente, um segundo botão para o mesmo lugar
  // seria ruído: só a linha do pedido tem "Ver cliente".
  await expect(page.getByRole("button", { name: "Ver cliente" })).toHaveCount(
    1
  );
  await page.getByRole("button", { name: "Ver cliente" }).click();

  await expect(page).toHaveURL(/\/clients\/cc-1/);
});

test("pendências: filtrar por tipo vai ao backend e fica na URL", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    MyPendingItems: (variables) =>
      response(variables.types ? [order()] : [item(), order(), comeBack()]),
  });

  await page.goto("/pending");
  await expect(page.getByText("Mercadinho do Zé")).toBeVisible();

  await page.getByRole("button", { name: "Filtros" }).click();
  const tipo = page
    .locator("[data-filters-panel]")
    .getByPlaceholder("Todos os tipos");
  await tipo.click();
  await page
    .locator("[data-select-dropdown]")
    .getByText("Pedidos parados", { exact: true })
    .click();

  await expect
    .poll(() => spy.lastVariables("MyPendingItems")?.types)
    .toEqual(["ORDER_STALLED"]);
  await expect(page.getByText("Mercadinho do Zé")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Filtros (1)" })).toBeVisible();
  // Na URL: quem abre o pedido e volta cai no mesmo filtro.
  await expect(page).toHaveURL(/type=ORDER_STALLED/);
});

test("pendências: vendedor não filtra por vendedor nem vê a coluna", async ({
  page,
}) => {
  await mockGraphql(page, {
    MyPendingItems: () => response([item()]),
  });

  await page.goto("/pending");
  await expect(page.getByText("Mercadinho do Zé")).toBeVisible();

  await expect(
    page.getByRole("columnheader", { name: "Vendedor" })
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Filtros" }).click();
  const panel = page.locator("[data-filters-panel]");
  await expect(panel.getByPlaceholder("Todos os tipos")).toBeVisible();
  await expect(panel.getByPlaceholder("Toda a empresa")).toHaveCount(0);
});

test("pendências: gestor filtra por vendedor e vê de quem é cada uma", async ({
  page,
}) => {
  await grantRole(page, "OWNER");

  const spy = await mockGraphql(page, {
    MyPendingItems: () => response([item()]),
    PendingSellers: () => ({
      pending_sellers: {
        edges: [
          { node: { id: "seller-1", name: "João Sacramento", isActive: true } },
          { node: { id: "seller-2", name: "Mariana Souza", isActive: true } },
        ],
        totalCount: 2,
      },
    }),
  });

  await page.goto("/pending");

  const row = page.getByRole("row").filter({ hasText: "Mercadinho do Zé" });
  await expect(row).toContainText("João Sacramento");

  await page.getByRole("button", { name: "Filtros" }).click();
  const vendedor = page
    .locator("[data-filters-panel]")
    .getByPlaceholder("Toda a empresa");
  await vendedor.click();
  await page
    .locator("[data-select-dropdown]")
    .getByText("Mariana Souza", { exact: true })
    .click();

  await expect
    .poll(() => spy.lastVariables("MyPendingItems")?.sellerId)
    .toBe("seller-2");
});

test("pendências: lista vazia é boa notícia, não erro", async ({ page }) => {
  await mockGraphql(page, { MyPendingItems: () => response([]) });

  await page.goto("/pending");

  await expect(page.getByText("Nada pendente")).toBeVisible();
  // Os contadores continuam lá, zerados: sumir pareceria defeito.
  await expect(page.getByText("Visitas atrasadas")).toBeVisible();
  await expect(page.getByText("Clientes sem contato")).toBeVisible();
});
