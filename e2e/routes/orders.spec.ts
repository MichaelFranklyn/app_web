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

  // Eyebrow é único por página (a sidebar repete "Pedidos", o eyebrow não).
  await expect(page.getByText(/05.*Pedidos/)).toBeVisible();
});
