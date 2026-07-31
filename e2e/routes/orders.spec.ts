import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

test("orders: lista vazia carrega e renderiza o cabeçalho", async ({
  page,
}) => {
  await mockGraphql(page, {
    Orders: () => ({ orders_list: emptyConnection() }),
    OrderStats: () => ({
      orderStats: { totalOrders: 0, totalAmount: "0", avgTicket: "0" },
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
      orderStats: { totalOrders: 0, totalAmount: "0", avgTicket: "0" },
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
});
