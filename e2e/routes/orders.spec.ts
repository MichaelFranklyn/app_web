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
