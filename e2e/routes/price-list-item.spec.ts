import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Cauda longa — adicionar item a uma tabela de preço
 * (factories/[id]/price-lists/[priceListId], client-side: PriceListDetail via useQuery).
 * Select-create: produto + nível (selects custom) + preço (currency).
 */
const URL = "/factories/factory-1/price-lists/pl-1";

test("tabela de preço: adiciona um item (produto + nível + preço)", async ({
  page,
}) => {
  await mockGraphql(page, {
    PriceListDetail: () => ({
      price_list_detail: {
        status: true,
        message: "ok",
        data: {
          id: "pl-1",
          name: "Tabela 2026",
          validFrom: "2026-01-01",
          validUntil: null,
          isActive: true,
        },
      },
    }),
    PriceListItems: () => ({
      price_list_items: {
        edges: [],
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: 0,
      },
    }),
    AddItemProductOptions: () => ({
      products: {
        edges: [
          {
            node: {
              id: "p-1",
              name: "Produto A",
              sku: "SKU-001",
              unitLabel: { id: "ul-1", label: "CX" },
            },
          },
        ],
      },
    }),
    AddItemTierOptions: () => ({
      priceTiers: { edges: [{ node: { id: "t-1", name: "Varejo" } }] },
    }),
    CreatePriceListItem: () => ({
      createPriceListItem: {
        status: true,
        message: "ok",
        data: { id: "pli-1" },
      },
    }),
  });

  await page.goto(URL);
  await page.getByRole("button", { name: "Adicionar item" }).click();

  const dialog = page.getByRole("dialog");

  const produto = dialog.getByRole("textbox", { name: "Produto" });
  await produto.click();
  await produto.pressSequentially("Produto A");
  await page
    .locator("[data-select-dropdown]")
    .getByText("Produto A (SKU-001)", { exact: true })
    .click();

  const nivel = dialog.getByRole("textbox", { name: "Nível comercial" });
  await nivel.click();
  await nivel.pressSequentially("Varejo");
  await page
    .locator("[data-select-dropdown]")
    .getByText("Varejo", { exact: true })
    .click();

  await dialog.locator('input[name="unitPrice"]').fill("100,00");
  await dialog.getByRole("button", { name: "Cadastrar" }).click();

  await expect(page.getByText("Item de preço cadastrado")).toBeVisible();
});
