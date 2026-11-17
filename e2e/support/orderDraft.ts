import { expect, Page } from "@playwright/test";

/**
 * Pedido sem item não é criado: todo E2E que grava um pedido novo põe antes um
 * item no rascunho. Estes mocks dão um produto ao catálogo e aceitam o item.
 */
export const oneProductMocks = (factoryId: string) => ({
  // O catálogo é da fábrica VINCULADA: sem o vínculo, não há produto.
  OrderItemCompanyFactories: () => ({
    companyFactories: {
      edges: [
        {
          node: {
            id: `cf-${factoryId}`,
            factoryId,
            ipiInOrder: false,
            freeFreightCifAmount: null,
          },
        },
      ],
    },
  }),
  // Com o vínculo resolvido, condições e nível também são consultados — sem
  // resposta bem-formada o Apollo repete em loop.
  OrderPaymentTerms: () => ({ factoryPaymentTerms: { edges: [] } }),
  OrderItemLinkedTier: () => ({ sellerClientFactoryList: { edges: [] } }),
  // A lista do select (busca paginada) …
  OrderItemProductOptions: () => ({
    products: {
      edges: [
        {
          node: { id: "p-1", name: "Produto X", sku: "SKU-1", imageUrl: null },
        },
      ],
      pageInfo: { hasNextPage: false, endCursor: null },
    },
  }),
  // … e o nó completo do produto escolhido (unidade, múltiplo, IPI).
  OrderItemProducts: () => ({
    products: {
      edges: [
        {
          node: {
            id: "p-1",
            name: "Produto X",
            sku: "SKU-1",
            imageUrl: null,
            saleMultiple: null,
            unitPerPack: "1.0000",
            unit: { id: "ul-1", label: "CX" },
            taxes: [],
          },
        },
      ],
    },
  }),
  // Os itens do rascunho vão num lote só, depois do pedido (tudo ou nada).
  CreateOrderItemsForNewOrder: (variables: Record<string, unknown>) => ({
    createOrderItems: {
      status: true,
      code: 201,
      message: "ok",
      data: ((variables.items as unknown[]) ?? []).map((_, i) => ({
        id: `oi-${i + 1}`,
      })),
    },
  }),
});

/** Escolhe o "Produto X", digita preço e quantidade e o põe na lista. */
export async function addDraftItem(page: Page) {
  const produto = page.getByRole("combobox", {
    name: "Produto (nome ou código)",
  });
  await produto.click();
  await page
    .locator("[data-select-dropdown]")
    .getByText("SKU-1 — Produto X", { exact: true })
    .click();
  await page.getByRole("textbox", { name: /Preço por/ }).fill("1000");
  await page.getByRole("spinbutton", { name: "Quantidade" }).fill("10");
  await page.getByRole("button", { name: "Adicionar item" }).click();
  await expect(
    page.getByRole("button", { name: "Criar pedido com 1 item" })
  ).toBeVisible();
}
