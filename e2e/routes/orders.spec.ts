import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

test("orders: lista vazia carrega e renderiza o cabeçalho", async ({
  page,
}) => {
  await mockGraphql(page, {
    Orders: () => ({ orders_list: emptyConnection() }),
    OrderStats: () => ({
      orderStats: {
        totalOrders: 0,
        totalAmount: "0",
        avgTicket: "0",
        invoicedOrders: 0,
        invoicedAmount: "0",
        commissionAmount: "0",
      },
    }),
  });

  await page.goto("/orders");

  // O <h1> do header é único (a sidebar repete "Pedidos", mas como link).
  await expect(
    page.getByRole("heading", { name: "Pedidos", level: 1 })
  ).toBeVisible();
});

test("orders: a aba 'Ainda não faturados' consulta com o filtro pendente", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    Orders: () => ({ orders_list: emptyConnection() }),
    OrderStats: () => ({
      orderStats: {
        totalOrders: 0,
        totalAmount: "0",
        avgTicket: "0",
        invoicedOrders: 0,
        invoicedAmount: "0",
        commissionAmount: "0",
      },
    }),
  });

  await page.goto("/orders");
  await page.getByRole("tab", { name: "Ainda não faturados" }).click();

  await expect(page).toHaveURL(/tab=pending/);
  await expect(
    page.getByRole("heading", { name: "Pedidos a faturar" })
  ).toBeVisible();

  // O que importa não é a aba pintada, é a consulta ter saído filtrada.
  await expect
    .poll(() => JSON.stringify(spy.lastVariables("Orders") ?? {}))
    .toContain("pending_invoice");

  // A aba já É um recorte por situação: o campo não pode aparecer no painel.
  await page.getByRole("button", { name: "Filtros" }).click();
  await expect(
    page.locator("[data-filters-panel]").getByPlaceholder("Todas as situações")
  ).toHaveCount(0);
});

test("orders: filtrar por situação vai ao backend pelo NOME do enum", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    Orders: () => ({ orders_list: emptyConnection() }),
    OrderStats: () => ({
      orderStats: {
        totalOrders: 0,
        totalAmount: "0",
        avgTicket: "0",
        invoicedOrders: 0,
        invoicedAmount: "0",
        commissionAmount: "0",
      },
    }),
  });

  await page.goto("/orders");
  await page.getByRole("button", { name: "Filtros" }).click();

  await page
    .locator("[data-filters-panel]")
    .getByPlaceholder("Todas as situações")
    .click();
  await page
    .locator("[data-select-dropdown]")
    .getByText("Faturado", { exact: true })
    .click();

  // O valor tem de ser o NOME (INVOICED), não o rótulo em português: é ele que
  // o backend traduz no valor gravado na coluna.
  await expect
    .poll(() => {
      const input = spy.lastVariables("Orders")?.input as
        | { filters?: { field: string; value: string }[] }
        | undefined;
      return input?.filters?.find((f) => f.field === "status")?.value;
    })
    .toBe("INVOICED");

  // Os KPIs do topo consultam o MESMO recorte da tabela.
  await expect
    .poll(() => JSON.stringify(spy.lastVariables("OrderStats") ?? {}))
    .toContain("INVOICED");
});

const ORDER_STATS_ZERO = {
  orderStats: {
    totalOrders: 0,
    totalAmount: "0",
    avgTicket: "0",
    invoicedOrders: 0,
    invoicedAmount: "0",
    commissionAmount: "0",
  },
};

test("orders: ordenar por Valor manda `order` ao backend e marca a coluna", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    Orders: () => ({ orders_list: emptyConnection() }),
    OrderStats: () => ORDER_STATS_ZERO,
  });

  await page.goto("/orders");
  await page.getByRole("button", { name: "Valor" }).click();

  // Ordenação de SERVIDOR: o que prova a feature é a consulta ter saído com
  // `order`, não a tabela ter reordenado o que já estava na tela.
  await expect
    .poll(() => JSON.stringify(spy.lastVariables("Orders") ?? {}))
    .toContain('"order":{"by":"total_amount","dir":"desc"}');

  // A URL carrega o recorte: um pedido ordenado pode ser copiado e enviado.
  await expect(page).toHaveURL(/sortBy=total_amount/);
  await expect(page).toHaveURL(/sortDir=desc/);

  await expect(
    page.getByRole("columnheader", { name: "Valor" })
  ).toHaveAttribute("aria-sort", "descending");
});

test("orders: clicar de novo inverte a direção", async ({ page }) => {
  const spy = await mockGraphql(page, {
    Orders: () => ({ orders_list: emptyConnection() }),
    OrderStats: () => ORDER_STATS_ZERO,
  });

  await page.goto("/orders?sortBy=total_amount&sortDir=desc");
  await page.getByRole("button", { name: "Valor" }).click();

  await expect
    .poll(() => JSON.stringify(spy.lastVariables("Orders") ?? {}))
    .toContain('"dir":"asc"');
  await expect(
    page.getByRole("columnheader", { name: "Valor" })
  ).toHaveAttribute("aria-sort", "ascending");
});

test("orders: voltar à ordem padrão limpa a URL e para de mandar `order`", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    Orders: () => ({ orders_list: emptyConnection() }),
    OrderStats: () => ORDER_STATS_ZERO,
  });

  // A data do pedido já vem em desc do backend; a tela mostra isso sem ter
  // pedido nada. Da posição invertida, um clique deve voltar ao padrão — e
  // voltar significa SUMIR com os parâmetros, não repeti-los.
  await page.goto("/orders?sortBy=order_date&sortDir=asc");
  await page.getByRole("button", { name: "Data do pedido" }).click();

  await expect(page).not.toHaveURL(/sortBy=/);
  await expect
    .poll(() => JSON.stringify(spy.lastVariables("Orders") ?? {}))
    .not.toContain('"order"');

  // Some da URL, mas continua indicada: a lista segue ordenada por data.
  await expect(
    page.getByRole("columnheader", { name: "Data do pedido" })
  ).toHaveAttribute("aria-sort", "descending");
});
