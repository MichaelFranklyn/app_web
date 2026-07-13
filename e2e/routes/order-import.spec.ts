import { expect, test } from "../support/fixtures";
import { mockGraphql, orderDetailData } from "../support/graphql";

/**
 * Cauda longa — wizard de IMPORTAÇÃO de itens (orders/[id], ImportOrderModal).
 * Padrão novo: upload de arquivo (Input.Archive → input[type=file]) + 3 mutations
 * encadeadas. PDF cujo ExtractOrderFile devolve `items` pula o mapeamento de
 * colunas e auto-avança para a Revisão; depois "Importar" grava (ConfirmOrderImport).
 * O conteúdo do arquivo é irrelevante (as mutations são mockadas).
 */
const URL = "/orders/order-1";

test("pedido/import: importa itens de um arquivo (PDF mockado)", async ({
  page,
}) => {
  const gql = await mockGraphql(page, {
    OrderDetail: () => ({
      order: {
        status: true,
        code: 200,
        message: "ok",
        data: orderDetailData({ totalAmount: "0", commissionAmount: "0" }),
      },
    }),
    OrderItems: () => ({
      orderItems: {
        edges: [],
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: 0,
      },
    }),
    ExtractOrderFile: () => ({
      extractOrderFile: {
        status: true,
        message: "ok",
        data: {
          fileType: "pdf",
          rows: [],
          items: [{ sku: "SKU-001", quantity: "10", unitPrice: "100.00" }],
        },
      },
    }),
    PreviewOrderImport: () => ({
      previewOrderImport: {
        status: true,
        message: "ok",
        data: {
          matchedCount: 1,
          unmatchedCount: 0,
          candidates: [
            {
              rowIndex: 1,
              rawSku: "SKU-001",
              rawName: "Produto Teste",
              quantity: "10",
              matched: true,
              productId: "p-1",
              productName: "Produto Teste",
              tierId: "t-1",
              tierName: "Varejo",
              unitPrice: "100.00",
              confidence: 100,
              message: null,
              tierOptions: [
                { tierId: "t-1", tierName: "Varejo", unitPrice: "100.00" },
              ],
            },
          ],
        },
      },
    }),
    ConfirmOrderImport: () => ({
      confirmOrderImport: {
        status: true,
        message: "ok",
        data: { created: 1, failed: 0, errors: [] },
      },
    }),
  });

  await page.goto(URL);
  await page.getByRole("button", { name: "Importar pedido" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // Sobe um PDF qualquer; o ExtractOrderFile mockado devolve os itens.
  await dialog.locator('input[type="file"]').setInputFiles({
    name: "pedido.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 conteúdo de teste"),
  });

  // Auto-avança para Revisão; "Importar N item(ns)" grava.
  await dialog.getByRole("button", { name: /Importar/ }).click();

  // "Itens importados" aparece no toast e no passo Resultado — ambos = sucesso.
  await expect(page.getByText("Itens importados").first()).toBeVisible();

  // Não basta a tela reagir: o payload de ConfirmOrderImport tem que carregar o
  // item revisado (produto/nível/qtd/preço mapeados), não um objeto qualquer.
  const confirmVars = await gql.waitForCall("ConfirmOrderImport");
  const { orderId, items } = confirmVars.input as {
    orderId: string;
    items: Record<string, unknown>[];
  };
  expect(orderId).toBe("order-1");
  expect(items).toHaveLength(1);
  expect(items[0]).toMatchObject({
    productId: "p-1",
    tierId: "t-1",
    quantity: 10,
    unitPrice: 100,
    sku: "SKU-001",
  });
});
