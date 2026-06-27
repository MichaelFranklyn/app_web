import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

/**
 * Lote 4 — detalhe do pedido (orders/[id], client-side: OrderDetail via useQuery).
 * Header = editar/deletar; OrderItemsTable = itens (add/edit/delete por ícone aria-label).
 */
const URL = "/orders/order-1";

const orderData = () => ({
  id: "order-1",
  orderDate: "2026-06-22",
  totalAmount: "1000.00",
  commissionAmount: "100.00",
  status: "DRAFT",
  freightType: null,
  fileUrl: null,
  fileParsed: false,
  notes: null,
  createdAt: "2026-06-22T00:00:00Z",
  seller: { id: "s-1", name: "Vendedor" },
  client: { id: "c-1", razaoSocial: "Cliente LTDA", nomeFantasia: "Cliente" },
  factory: { id: "f-1", nomeFantasia: "Fábrica", razaoSocial: "Fábrica LTDA" },
});

const orderItem = () => ({
  id: "oi-1",
  quantity: 10,
  unitsTotal: 10,
  unitPrice: "100.00",
  discount: "0",
  subtotal: "1000.00",
  avgShelfDays: null,
  source: "MANUAL",
  product: { id: "p-1", name: "Produto X", saleMultiple: null },
  tier: { id: "t-1", name: "Varejo" },
});

const renderMock = (items: Array<Record<string, unknown>> = []) => ({
  OrderDetail: () => ({
    order: { status: true, code: 200, message: "ok", data: orderData() },
  }),
  OrderItems: () => ({
    orderItems: {
      edges: items.map((node) => ({ node })),
      pageInfo: { hasNextPage: false, endCursor: null },
      totalCount: items.length,
    },
  }),
});

test("pedido detalhe: edita o pedido", async ({ page }) => {
  await mockGraphql(page, {
    ...renderMock(),
    UpdateOrder: (v) => ({
      updateOrder: {
        status: true,
        code: 200,
        message: "ok",
        data: { id: "order-1", ...(v.input as object) },
      },
    }),
  });

  await page.goto(URL);
  await page.getByRole("button", { name: "Editar", exact: true }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Editar pedido")).toBeVisible();
  await dialog.locator('[name="notes"]').fill("Observação do pedido E2E");
  await dialog.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Pedido atualizado com sucesso")).toBeVisible();
});

test("pedido detalhe: deleta o pedido", async ({ page }) => {
  await mockGraphql(page, {
    ...renderMock(),
    Orders: () => ({ orders_list: emptyConnection() }),
    OrderStats: () => ({
      orderStats: { totalOrders: 0, totalAmount: "0", avgTicket: "0" },
    }),
    DeleteOrder: () => ({ deleteOrder: { status: true, message: "ok" } }),
  });

  await page.goto(URL);
  await page.getByRole("button", { name: "Deletar pedido" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Confirmar exclusão" })
    .click();

  await expect(page).toHaveURL(/\/orders$/);
});

test("pedido detalhe: edita um item", async ({ page }) => {
  await mockGraphql(page, {
    ...renderMock([orderItem()]),
    UpdateOrderItem: (v) => ({
      updateOrderItem: {
        status: true,
        message: "ok",
        data: { id: v.id, ...(v.input as object) },
      },
    }),
  });

  await page.goto(URL);
  await page.getByRole("button", { name: "Editar item" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.locator('input[name="quantity"]').fill("20");
  await dialog.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Item atualizado")).toBeVisible();
});

test("pedido detalhe: remove um item", async ({ page }) => {
  await mockGraphql(page, {
    ...renderMock([orderItem()]),
    DeleteOrderItem: () => ({
      deleteOrderItem: { status: true, message: "ok" },
    }),
  });

  await page.goto(URL);
  await page.getByRole("button", { name: "Remover item" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Remover item" })
    .click();

  await expect(page.getByText("Item removido do pedido")).toBeVisible();
});
