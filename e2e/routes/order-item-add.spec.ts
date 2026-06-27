import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Cauda longa — adicionar item ao pedido (orders/[id], AddOrderItemModal).
 *
 * CASCATA de 3 queries para resolver produto/nível/preço a partir da fábrica
 * do pedido:
 *   1) OrderItemCompanyFactories  → acha o company_factory da fábrica (f-1)
 *   2) OrderItemPriceLists        → acha a tabela de preço ATIVA
 *   3) OrderItemPriceListItems    → produto + nível + preço
 * Selecionar o produto reseta o nível; selecionar o nível preenche o preço
 * (campo disabled, derivado do priceMap). O preço vai no input da mutation.
 */
const URL = "/orders/order-1";

const orderData = () => ({
  id: "order-1",
  orderDate: "2026-06-22",
  totalAmount: "0.00",
  commissionAmount: "0.00",
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
    OrderItemPriceListItems: () => ({
      priceListItems: {
        edges: [
          {
            node: {
              id: "pli-1",
              unitPrice: "100.00",
              product: {
                id: "p-1",
                name: "Produto X",
                sku: "SKU-1",
                saleMultiple: null,
                unitLabel: { id: "ul-1", label: "CX" },
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

  const nivel = dialog.getByRole("textbox", { name: "Nível comercial" });
  await nivel.click();
  await nivel.pressSequentially("Varejo");
  await page
    .locator("[data-select-dropdown]")
    .getByText("Varejo", { exact: true })
    .click();

  await dialog.locator('input[name="quantity"]').fill("10");
  await dialog.getByRole("button", { name: "Adicionar" }).click();

  await expect(page.getByText("Item adicionado ao pedido")).toBeVisible();
});
