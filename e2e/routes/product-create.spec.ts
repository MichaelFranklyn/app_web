import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Cauda longa — cadastrar um produto no catálogo da fábrica
 * (factories/[id]/products → AddProductModal). Página SSR (CompanyFactoryDetail
 * via stub). 3 selects de catálogo (categoria/unidade/rótulo) carregados em
 * paralelo ao abrir o modal + campos de texto.
 *
 * GOTCHA: os labels dos selects usam labelWithHelp → o nome acessível inclui o
 * botão de ajuda ("Ajuda: X"); por isso os selects são localizados por REGEX.
 * "Unidade" é desambiguado do campo de texto "Unidades por embalagem".
 */
const base = "/factories/factory-1";
const conn = (nodes: Array<Record<string, unknown>>) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
  totalCount: nodes.length,
});

test("fábrica/produtos: cadastra um produto (categoria + unidade + rótulo)", async ({
  page,
}) => {
  await mockGraphql(page, {
    FactoryProducts: () => ({ factory_products: conn([]) }),
    ProductCategoriesOptions: () => ({
      productCategories: {
        edges: [{ node: { id: "cat-1", name: "Cimento" } }],
      },
    }),
    ProductUnitsOptions: () => ({
      productUnits: { edges: [{ node: { id: "u-1", label: "KG" } }] },
    }),
    ProductUnitLabelsOptions: () => ({
      productUnitLabels: { edges: [{ node: { id: "ul-1", label: "Saco" } }] },
    }),
    CreateProduct: (v) => {
      const i = v.input as Record<string, unknown>;
      return {
        createProduct: {
          status: true,
          message: "ok",
          data: {
            id: "prod-novo-1",
            sku: i.sku,
            name: i.name,
            ncm: i.ncm ?? null,
            unitPerPack: i.unitPerPack,
            isActive: true,
            unitId: "u-1",
            unitLabelId: "ul-1",
            unit: { id: "u-1", label: "KG" },
            unitLabel: { id: "ul-1", label: "Saco" },
            category: { id: "cat-1", name: "Cimento" },
          },
        },
      };
    },
  });

  await page.goto(`${base}/products`);
  await page.getByRole("button", { name: "Novo produto" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await dialog.locator('input[name="sku"]').fill("CIM-50");
  await dialog.locator('input[name="name"]').fill("Cimento CP-II 50kg");

  const categoria = dialog.getByRole("textbox", { name: /^Categoria/ });
  await categoria.click();
  await categoria.pressSequentially("Cimento");
  await page
    .locator("[data-select-dropdown]")
    .getByText("Cimento", { exact: true })
    .click();

  const unidade = dialog.getByRole("textbox", { name: /^Unidade(?:\s|$)/ });
  await unidade.click();
  await unidade.pressSequentially("KG");
  await page
    .locator("[data-select-dropdown]")
    .getByText("KG", { exact: true })
    .click();

  const rotulo = dialog.getByRole("textbox", { name: /^Rótulo de embalagem/ });
  await rotulo.click();
  await rotulo.pressSequentially("Saco");
  await page
    .locator("[data-select-dropdown]")
    .getByText("Saco", { exact: true })
    .click();

  await dialog.locator('input[name="unitPerPack"]').fill("1");

  await dialog.getByRole("button", { name: "Cadastrar" }).click();

  await expect(page.getByText("Produto cadastrado com sucesso")).toBeVisible();
});
