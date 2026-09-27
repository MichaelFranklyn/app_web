import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * As abas "Esperando entrega" e "Esperando faturamento" de Pedidos (a antiga
 * página "Pedidos parados"): confirmar a entrega em lote e faturar pelo XML.
 */
const order = (over: Record<string, unknown>) => ({
  id: "o-1",
  orderDate: "2026-07-01",
  invoicedAt: "2026-07-05",
  invoiceNumber: null,
  deliveryEstimateDays: null,
  totalAmount: "1000.00",
  commissionAmount: "0",
  status: "INVOICED",
  isDeliveryOverdue: true,
  expectedDeliveryDate: "2026-08-04",
  seller: { id: "s-1", name: "Calazans" },
  client: { id: "c-1", razaoSocial: "LOJA BETA LTDA", nomeFantasia: null },
  factory: {
    id: "f-1",
    nomeFantasia: "Alfa",
    nickname: null,
    razaoSocial: "ALFA",
  },
  ...over,
});

const connection = (nodes: unknown[]) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
  totalCount: nodes.length,
});

const noStats = () => ({
  orderStats: {
    totalOrders: 0,
    totalAmount: "0",
    avgTicket: "0",
    invoicedOrders: 0,
    invoicedAmount: "0",
    commissionAmount: "0",
  },
});

/** A lista responde conforme a aba: o filtro que a consulta leva decide. */
const stalled = () => ({
  OrderStats: noStats,
  Orders: (variables: Record<string, unknown>) => {
    const text = JSON.stringify(variables);
    if (text.includes("awaiting_delivery")) {
      return { orders_list: connection([order({})]) };
    }
    if (text.includes("pending_invoice")) {
      return {
        orders_list: connection([
          order({
            id: "o-2",
            invoicedAt: null,
            status: "CONFIRMED",
            totalAmount: "2090.16",
            isDeliveryOverdue: false,
            expectedDeliveryDate: null,
          }),
        ]),
      };
    }
    return { orders_list: connection([]) };
  },
});

test("pedidos parados: confirma a entrega na data prevista de cada pedido", async ({
  page,
}) => {
  const calls: Record<string, unknown>[] = [];
  await mockGraphql(page, {
    ...stalled(),
    MarkOrdersDelivered: (variables: Record<string, unknown>) => {
      calls.push(variables);
      return {
        markOrdersDelivered: { delivered: 1, stockedProducts: 3, failures: [] },
      };
    },
  });

  await page.goto("/orders?tab=delivery");
  // A coluna mostra o que vai ser gravado: faturado 05/07 + 30 dias.
  await expect(page.getByText("04/08/2026")).toBeVisible();

  await page
    .getByText("LOJA BETA LTDA")
    .first()
    .locator("xpath=ancestor::tr")
    .locator("label")
    .first()
    .click();
  await page.getByRole("button", { name: "Confirmar entrega" }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Confirmar entrega" }).click();

  await expect(page.getByText(/1 entrega\(s\) confirmada\(s\)/)).toBeVisible();
  // Sem data escolhida, cada pedido recebe a própria previsão no backend.
  expect(calls[0]).toEqual({ ids: ["o-1"], deliveredAt: null });
});

test("pedidos parados: fatura pelo XML só a nota pronta", async ({ page }) => {
  const invoiced: Record<string, unknown>[] = [];
  await mockGraphql(page, {
    ...stalled(),
    PreviewNfeImport: () => ({
      previewNfeImport: [
        {
          fileName: "nota_1.xml",
          status: "READY",
          reasons: [],
          orderId: "o-2",
          orderTotal: "2090.16",
          invoiceNumber: "77001",
          issuedAt: "2026-09-10",
          emitterName: "Alfa",
          recipientName: "LOJA BETA LTDA",
          netProductsTotal: "2090.16",
          invoiceTotal: "2300.00",
          installments: [],
        },
        {
          fileName: "nota_2.xml",
          status: "NEEDS_REVIEW",
          reasons: [
            "O valor dos produtos na nota é 99,5% menor que o do pedido.",
          ],
          orderId: "o-3",
          orderTotal: "2090.16",
          invoiceNumber: "77002",
          issuedAt: "2026-09-10",
          emitterName: "Alfa",
          recipientName: "LOJA BETA LTDA",
          netProductsTotal: "10.00",
          invoiceTotal: "10.00",
          installments: [],
        },
      ],
    }),
    InvoiceOrdersFromNfe: (variables: Record<string, unknown>) => {
      invoiced.push(variables);
      return {
        invoiceOrdersFromNfe: [
          {
            fileName: "nota_1.xml",
            orderId: "o-2",
            isInvoiced: true,
            message: "ok",
          },
        ],
      };
    },
  });

  // A ação do XML mora na aba de quem espera faturamento.
  await page.goto("/orders");
  await page.getByRole("tab", { name: "Esperando faturamento" }).click();
  await page.getByRole("button", { name: /faturar pelo xml da nota/i }).click();
  const dialog = page.getByRole("dialog");

  await dialog.locator('input[type="file"]').setInputFiles([
    {
      name: "nota_1.xml",
      mimeType: "text/xml",
      buffer: Buffer.from("<nfeProc/>"),
    },
    {
      name: "nota_2.xml",
      mimeType: "text/xml",
      buffer: Buffer.from("<nfeProc/>"),
    },
  ]);
  await dialog.getByRole("button", { name: "Conferir as notas" }).click();

  await expect(dialog.getByText("Pronto para faturar")).toBeVisible();
  await expect(dialog.getByText(/99,5% menor/)).toBeVisible();
  await expect(
    dialog.getByRole("link", { name: "Abrir o pedido" })
  ).toHaveAttribute("href", "/orders/o-3");

  await dialog.getByRole("button", { name: "Faturar 1 pedido(s)" }).click();
  await expect(
    page.getByText("1 pedido(s) faturado(s) pelas notas.")
  ).toBeVisible();

  const files = (
    invoiced[0] as { files: { fileName: string; orderId: string }[] }
  ).files;
  // Só a nota pronta vai para o faturamento, com o pedido que a prévia escolheu.
  expect(files.map((f) => [f.fileName, f.orderId])).toEqual([
    ["nota_1.xml", "o-2"],
  ]);
});

test("pedidos parados: o endereço antigo cai na aba certa de Pedidos", async ({
  page,
}) => {
  await mockGraphql(page, { ...stalled() });

  await page.goto("/orders/stalled?tab=faturamento");
  await expect(page).toHaveURL(/\/orders\?tab=pending$/);

  await page.goto("/orders/stalled");
  await expect(page).toHaveURL(/\/orders\?tab=delivery$/);
  await expect(
    page.getByRole("tab", { name: "Esperando entrega" })
  ).toHaveAttribute("data-state", "active");
});

test("abas de pedidos: o nome traz quantos esperam, com os filtros da tela", async ({
  page,
}) => {
  const counts: Record<string, unknown>[] = [];
  await mockGraphql(page, {
    ...stalled(),
    OrderTabCounts: (variables: Record<string, unknown>) => {
      counts.push(variables);
      return {
        pending: { totalOrders: 3 },
        delivery: { totalOrders: 59 },
      };
    },
  });
  await page.goto("/orders");

  await expect(
    page.getByRole("tab", { name: "Esperando faturamento (3)" })
  ).toBeVisible();
  await expect(
    page.getByRole("tab", { name: "Esperando entrega (59)" })
  ).toBeVisible();
  // "Todos" lista orçamento e cancelado: um número ali contaria outra coisa.
  await expect(page.getByRole("tab", { name: "Todos os pedidos" })).toHaveText(
    "Todos os pedidos"
  );

  const text = JSON.stringify(counts[0]);
  expect(text).toContain("pending_invoice");
  expect(text).toContain("awaiting_delivery");
});
