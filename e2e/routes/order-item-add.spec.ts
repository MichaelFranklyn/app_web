import { expect, test } from "../support/fixtures";
import { mockGraphql, orderDetailData } from "../support/graphql";

/**
 * Cauda longa — adicionar item ao pedido (orders/[id], AddOrderItemModal).
 *
 * CASCATA de queries para resolver produto/nível/preço a partir da fábrica
 * do pedido:
 *   1) OrderItemCompanyFactories  → acha o company_factory da fábrica (f-1)
 *   2) OrderItemProductOptions    → a PÁGINA de produtos que o select mostra
 *   3) OrderItemProducts          → o nó completo do produto escolhido (por id)
 *   4) OrderItemPriceLists        → acha a tabela de preço ATIVA
 *   5) OrderItemPriceListItems    → preço do produto escolhido, por nível
 * Selecionar o produto RESOLVE o nível (o último usado, o acordado com o
 * cliente, ou o único com preço) e o nível preenche o preço (campo disabled,
 * derivado do priceMap). O preço vai no input da mutation.
 */
const URL = "/orders/order-1";

const orderData = () =>
  orderDetailData({ totalAmount: "0.00", commissionAmount: "0.00" });

test("pedido detalhe: adiciona um item (cascata produto/nível/preço)", async ({
  page,
}) => {
  await mockGraphql(page, {
    OrderDetail: () => ({
      order: { status: true, code: 200, message: "ok", data: orderData() },
    }),
    OrderItems: () => ({
      orderItems: {
        edges: [],
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: 0,
      },
    }),
    OrderItemCompanyFactories: () => ({
      companyFactories: { edges: [{ node: { id: "cf-1", factoryId: "f-1" } }] },
    }),
    OrderItemPriceLists: () => ({
      factoryPriceLists: {
        edges: [
          {
            node: {
              id: "pl-1",
              name: "Tabela Ativa",
              isActive: true,
              validFrom: "2026-01-01",
              validUntil: null,
            },
          },
        ],
      },
    }),
    // As opções do select são uma BUSCA no servidor: o que o vendedor digita
    // vira filtro `like`, e o catálogo inteiro nunca é baixado.
    OrderItemProductOptions: () => ({
      products: {
        edges: [
          {
            node: {
              id: "p-1",
              name: "Produto X",
              sku: "SKU-1",
              imageUrl: null,
            },
          },
        ],
      },
    }),
    // O nó completo vem depois da escolha (`id in [p-1]`): é dele que saem
    // unidade, múltiplo de venda e IPI. Níveis vêm da FÁBRICA, não da tabela —
    // o nível é opcional e a tabela ativa serve só para sugerir o preço.
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
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    }),
    OrderItemTiers: () => ({
      priceTiers: { edges: [{ node: { id: "t-1", name: "Varejo" } }] },
    }),
    OrderItemPriceListItems: () => ({
      priceListItems: {
        edges: [
          {
            node: {
              id: "pli-1",
              unitPrice: "100.00",
              effectiveUnitPrice: "100.00",
              isPromoActive: false,
              product: {
                id: "p-1",
                name: "Produto X",
                sku: "SKU-1",
                saleMultiple: null,
                unitPerPack: "1.0000",
              },
              tier: { id: "t-1", name: "Varejo" },
            },
          },
        ],
      },
    }),
    CreateOrderItem: (v) => {
      const i = v.input as Record<string, unknown>;
      return {
        createOrderItem: {
          status: true,
          code: 200,
          message: "ok",
          data: {
            id: "oi-novo-1",
            quantity: i.quantity,
            unitsTotal: i.quantity,
            unitPrice: String(i.unitPrice),
            discount: String(i.discount ?? 0),
            subtotal: "1000.00",
            source: "MANUAL",
            product: { id: "p-1", name: "Produto X", saleMultiple: null },
            tier: { id: "t-1", name: "Varejo" },
          },
        },
      };
    },
  });

  await page.goto(URL);
  await page.getByRole("button", { name: "Adicionar item" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  const produto = dialog.getByRole("textbox", {
    name: "Produto (nome ou código)",
  });
  await produto.click();
  await produto.pressSequentially("Produto X");
  await page
    .locator("[data-select-dropdown]")
    .getByText("SKU-1 — Produto X", { exact: true })
    .click();

  // O nível NÃO é digitado: ele se preenche sozinho ao escolher o produto (o do
  // último item do pedido, o acordado com o cliente, ou o único com preço — ver
  // `resolveTierForProduct`). Este `expect` é o que prende esse preenchimento:
  // quando ele deixava o campo vazio, o preço aparecia sugerido e o nível, em
  // branco, e o vendedor gravava um item sem nível sem perceber.
  const nivel = dialog.getByRole("textbox", {
    name: "Nível comercial (opcional)",
  });
  await expect(nivel).toHaveValue("Varejo");

  await dialog.locator('input[name="quantity"]').fill("10");
  await dialog.getByRole("button", { name: "Adicionar" }).click();

  await expect(page.getByText("Item adicionado ao pedido")).toBeVisible();
});
