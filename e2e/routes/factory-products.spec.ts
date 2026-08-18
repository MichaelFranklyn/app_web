import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Lote 3 — aba de produtos da fábrica (factories/[id]/products). SSR via stub.
 * Ações por linha via MoreOptions (kebab) → menuitem, igual a users.
 */
const base = "/factories/factory-1/products";
const conn = (nodes: Array<Record<string, unknown>>) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
  totalCount: nodes.length,
});

const seedProduct = () => ({
  id: "p-1",
  sku: "SKU-001",
  name: "Produto Velho",
  ncm: null,
  unitPerPack: 1,
  isActive: true,
  needsAttention: false,
  attentionReason: null,
  unitId: "u-1",
  unitLabelId: "ul-1",
  unit: { id: "u-1", label: "UN" },
  unitLabel: { id: "ul-1", label: "CX" },
  category: { id: "c-1", name: "Categoria" },
});

// Opções de form (podem disparar ao montar a aba); vazias bastam p/ delete/toggle.
const productOptions = {
  ProductCategoriesOptions: () => ({ productCategories: { edges: [] } }),
  ProductUnitsOptions: () => ({ productUnits: { edges: [] } }),
  ProductUnitLabelsOptions: () => ({ productUnitLabels: { edges: [] } }),
};

test("fábrica/produtos: exclui um produto", async ({ page }) => {
  const products = [seedProduct()];
  await mockGraphql(page, {
    ...productOptions,
    FactoryProducts: () => ({ factory_products: conn(products) }),
    DeleteProduct: () => ({ deleteProduct: { status: true, message: "ok" } }),
  });

  await page.goto(base);
  await page
    .getByRole("row", { name: /Produto Velho/ })
    .getByRole("button")
    .last()
    .click();
  await page.getByRole("menuitem", { name: "Excluir" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Excluir" })
    .click();

  await expect(page.getByText("Produto removido com sucesso")).toBeVisible();
});

test("fábrica/produtos: edita um produto", async ({ page }) => {
  const products = [seedProduct()];
  await mockGraphql(page, {
    ...productOptions,
    FactoryProducts: () => ({ factory_products: conn(products) }),
    UpdateProduct: (v) => ({
      updateProduct: {
        status: true,
        message: "ok",
        data: { ...seedProduct(), ...(v.input as object) },
      },
    }),
  });

  await page.goto(base);
  await page
    .getByRole("row", { name: /Produto Velho/ })
    .getByRole("button")
    .last()
    .click();
  await page.getByRole("menuitem", { name: "Editar" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Editar produto")).toBeVisible();
  // categoria/unidade/rótulo já vêm pré-preenchidos do nó; só renomeamos.
  await dialog.locator('input[name="name"]').fill("Produto Renomeado");
  await dialog.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Produto atualizado com sucesso")).toBeVisible();
});

test("fábrica/produtos: desativa um produto", async ({ page }) => {
  const products = [seedProduct()];
  await mockGraphql(page, {
    ...productOptions,
    FactoryProducts: () => ({ factory_products: conn(products) }),
    UpdateProduct: () => ({
      updateProduct: {
        status: true,
        message: "ok",
        data: { id: "p-1", isActive: false },
      },
    }),
  });

  await page.goto(base);
  await page
    .getByRole("row", { name: /Produto Velho/ })
    .getByRole("button")
    .last()
    .click();
  await page.getByRole("menuitem", { name: "Desativar" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Desativar" })
    .click();

  await expect(page.getByText("Produto desativado com sucesso")).toBeVisible();
});

test("fábrica/produtos: filtra o catálogo por categoria", async ({ page }) => {
  // O painel de filtros monta as opções com o catálogo da EMPRESA e manda o
  // recorte ao backend — a lista é paginada, filtrar em memória esconderia o
  // que está nas páginas seguintes.
  const spy = await mockGraphql(page, {
    ...productOptions,
    ProductCategoriesOptions: () => ({
      productCategories: {
        edges: [{ node: { id: "c-1", name: "Torneiras" } }],
      },
    }),
    FactoryProducts: () => ({ factory_products: conn([seedProduct()]) }),
  });

  await page.goto(base);
  await page.getByRole("button", { name: "Filtros" }).click();
  const categoria = page.getByRole("textbox", { name: "Categoria" });
  await categoria.click();
  await page
    .locator("[data-select-dropdown]")
    .getByText("Torneiras", { exact: true })
    .click();

  await expect(page.getByRole("button", { name: "Filtros (1)" })).toBeVisible();
  await expect
    .poll(() =>
      spy
        .calls("FactoryProducts")
        .some((v) =>
          (
            (v?.input as { filters?: { field: string; value?: string }[] })
              ?.filters ?? []
          ).some((f) => f.field === "category_id" && f.value === "c-1")
        )
    )
    .toBe(true);
});
