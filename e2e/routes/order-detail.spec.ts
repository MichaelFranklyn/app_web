import { expect, test } from "../support/fixtures";
import {
  emptyConnection,
  mockGraphql,
  orderDetailData,
} from "../support/graphql";

/**
 * Lote 4 — detalhe do pedido (orders/[id], client-side: OrderDetail via useQuery).
 * Header = editar/deletar; OrderItemsTable = itens (add/edit/delete por ícone aria-label).
 */
const URL = "/orders/order-1";

const orderData = () => orderDetailData();

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
      orderStats: {
        totalOrders: 0,
        totalAmount: "0",
        avgTicket: "0",
        invoicedOrders: 0,
        invoicedAmount: "0",
        commissionAmount: "0",
      },
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

/**
 * Faturamento é lançamento manual (data da nota, prazo, entrega): corrigir tem
 * que ser possível sem apagar o pedido. O caminho pesado — refazer o
 * faturamento para lançar de novo como parcial — confirma dentro do modal.
 */
const invoicedOrder = () =>
  orderDetailData({
    status: "INVOICED",
    invoicedAt: "2026-07-10",
    paymentTermId: "term-1",
    deliveryEstimateDays: 15,
    paymentTerm: {
      id: "term-1",
      name: "30/60",
      installmentsDays: [30, 60],
      minOrderAmount: null,
    },
    availablePaymentTerms: [
      {
        id: "term-1",
        name: "30/60",
        installmentsDays: [30, 60],
        minOrderAmount: null,
      },
    ],
    installments: [
      {
        id: "inst-1",
        sequence: 1,
        amount: "500.00",
        commissionAmount: "50.00",
        dueDate: "2026-08-09",
        status: "PENDING",
        paidAt: null,
        isCommissionReceived: false,
        commissionReceivedAt: null,
      },
    ],
  });

test("pedido faturado: corrige os dados do faturamento", async ({ page }) => {
  const spy = await mockGraphql(page, {
    OrderDetail: () => ({
      order: { status: true, code: 200, message: "ok", data: invoicedOrder() },
    }),
    OrderItems: () => ({
      orderItems: {
        edges: [],
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: 0,
      },
    }),
    ReviseOrderInvoice: () => ({
      reviseOrderInvoice: {
        status: true,
        message: "Faturamento corrigido. As parcelas foram refeitas.",
        data: { id: "order-1" },
      },
    }),
  });

  await page.goto(URL);
  await page.getByRole("button", { name: "Editar faturamento" }).click();

  const dialog = page.getByRole("dialog");
  // A data usa o calendário do FormBuilder (campo não digitável); aqui basta
  // corrigir a previsão de entrega para provar que a revisão chega ao backend
  // com a data de faturamento preservada.
  await dialog.locator('[name="deliveryEstimateDays"]').fill("20");
  await dialog.getByRole("button", { name: "Salvar", exact: true }).click();

  await expect(page.getByText("Faturamento corrigido.")).toBeVisible();
  const sent = spy.lastVariables("ReviseOrderInvoice") as {
    input: { invoicedAt: string; deliveryEstimateDays: number };
  };
  expect(sent.input.deliveryEstimateDays).toBe(20);
  expect(sent.input.invoicedAt).toBe("2026-07-10");
});

test("pedido faturado: refaz o faturamento para lançar de novo", async ({
  page,
}) => {
  await mockGraphql(page, {
    OrderDetail: () => ({
      order: { status: true, code: 200, message: "ok", data: invoicedOrder() },
    }),
    OrderItems: () => ({
      orderItems: {
        edges: [],
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: 0,
      },
    }),
    UninvoiceOrder: () => ({
      uninvoiceOrder: {
        status: true,
        message: "Faturamento desfeito. O pedido voltou para confirmado.",
        data: { id: "order-1", status: "CONFIRMED", invoicedAt: null },
      },
    }),
  });

  await page.goto(URL);
  await page.getByRole("button", { name: "Editar faturamento" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Refazer faturamento" }).click();
  // Confirmação no corpo do próprio modal — sem empilhar outra janela.
  await expect(
    dialog.getByText("Refazer o faturamento deste pedido?")
  ).toBeVisible();
  await dialog
    .getByRole("button", { name: "Refazer faturamento" })
    .last()
    .click();

  await expect(page.getByText("Faturamento desfeito.")).toBeVisible();
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
