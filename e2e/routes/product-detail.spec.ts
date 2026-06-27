import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Lote 3 — detalhe do produto (factories/[id]/products/[productId], client-side:
 * ProductDetail via useQuery). Renderiza PricesTable, TaxesTable, ComponentsTable.
 * Cobrimos remoções (linha semeada → Trash → ConfirmModal "Remover").
 */
const URL = "/factories/factory-1/products/p-1";

const productDetail = () => ({
  product_detail: {
    status: true,
    message: "ok",
    data: {
      id: "p-1",
      name: "Produto Detalhe",
      sku: "SKU-001",
      unitPerPack: "1",
      ncm: null,
      saleMultiple: null,
      isActive: true,
      unitId: "u-1",
      unitLabelId: "ul-1",
      unit: { id: "u-1", label: "UN" },
      unitLabel: { id: "ul-1", label: "CX" },
      companyFactory: {
        id: "cf-1",
        factory: {
          id: "f-1",
          razaoSocial: "Fábrica LTDA",
          nomeFantasia: "Fábrica",
        },
      },
      category: { id: "c-1", name: "Categoria", segment: "Seg" },
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    },
  },
});

// Queries de render do detalhe (preços/impostos/componentes).
const renderMock = (over: {
  taxes?: Array<Record<string, unknown>>;
  components?: Array<Record<string, unknown>>;
}) => ({
  ProductDetail: () => productDetail(),
  ProductPriceListItems: () => ({
    price_list_items: { edges: [], totalCount: 0 },
  }),
  ProductTaxes: () => ({
    product_taxes: {
      edges: (over.taxes ?? []).map((node) => ({ node })),
      totalCount: (over.taxes ?? []).length,
    },
  }),
  ProductComponents: () => ({
    product_components_detail: {
      status: true,
      message: "ok",
      data: { id: "p-1", components: over.components ?? [] },
    },
  }),
});

test("produto detalhe: remove um imposto", async ({ page }) => {
  await mockGraphql(page, {
    ...renderMock({
      taxes: [
        {
          id: "pt-1",
          rate: "18.00",
          updatedAt: "2025-01-01T00:00:00Z",
          taxRule: { id: "tr-1", name: "ICMS" },
        },
      ],
    }),
    RemoveTaxFromProduct: () => ({
      removeTaxFromProduct: { status: true, message: "ok" },
    }),
  });

  await page.goto(URL);
  await page
    .getByRole("row", { name: /ICMS/ })
    .getByRole("button")
    .last()
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Remover" })
    .click();

  await expect(page.getByText("Imposto removido do produto")).toBeVisible();
});

test("produto detalhe: edita a alíquota de um imposto", async ({ page }) => {
  await mockGraphql(page, {
    ...renderMock({
      taxes: [
        {
          id: "pt-1",
          rate: "18.00",
          updatedAt: "2025-01-01T00:00:00Z",
          taxRule: { id: "tr-1", name: "ICMS" },
        },
      ],
    }),
    UpdateProductTax: (v) => ({
      updateProductTax: {
        status: true,
        message: "ok",
        data: { id: v.id, rate: (v.input as { rate: string }).rate },
      },
    }),
  });

  await page.goto(URL);
  await page
    .getByRole("row", { name: /ICMS/ })
    .getByRole("button")
    .first()
    .click();

  const dialog = page.getByRole("dialog");
  await dialog.locator('input[name="rate"]').fill("20");
  await dialog.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Alíquota atualizada com sucesso")).toBeVisible();
});

test("produto detalhe: edita a quantidade de um componente", async ({
  page,
}) => {
  await mockGraphql(page, {
    ...renderMock({
      components: [
        {
          id: "pc-1",
          quantity: "2",
          updatedAt: "2025-01-01T00:00:00Z",
          componentProductId: "p-2",
          component: {
            id: "p-2",
            sku: "SKU-002",
            name: "Parafuso",
            unitLabel: { id: "ul-2", label: "PC" },
          },
        },
      ],
    }),
    UpdateProductComponent: (v) => ({
      updateProductComponent: {
        status: true,
        message: "ok",
        data: {
          id: v.id,
          quantity: (v.input as { quantity: string }).quantity,
        },
      },
    }),
  });

  await page.goto(URL);
  await page
    .getByRole("row", { name: /Parafuso/ })
    .getByRole("button")
    .first()
    .click();

  const dialog = page.getByRole("dialog");
  await dialog.locator('input[name="quantity"]').fill("5");
  await dialog.getByRole("button", { name: "Salvar" }).click();

  await expect(
    page.getByText("Componente atualizado com sucesso")
  ).toBeVisible();
});

test("produto detalhe: remove um componente", async ({ page }) => {
  await mockGraphql(page, {
    ...renderMock({
      components: [
        {
          id: "pc-1",
          quantity: "2",
          updatedAt: "2025-01-01T00:00:00Z",
          componentProductId: "p-2",
          component: {
            id: "p-2",
            sku: "SKU-002",
            name: "Parafuso",
            unitLabel: { id: "ul-2", label: "PC" },
          },
        },
      ],
    }),
    RemoveComponentFromProduct: () => ({
      removeComponentFromProduct: { status: true, message: "ok" },
    }),
  });

  await page.goto(URL);
  await page
    .getByRole("row", { name: /Parafuso/ })
    .getByRole("button")
    .last()
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Remover" })
    .click();

  await expect(page.getByText("Componente removido do kit")).toBeVisible();
});
