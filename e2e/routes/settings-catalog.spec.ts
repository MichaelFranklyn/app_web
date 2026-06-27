import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * CRUD do catálogo (/settings/catalog). A página monta 4 seções, cada uma com
 * sua query de lista — todas precisam ser mockadas em todo teste. Criar = modal
 * (botão "Nova X" → submit); editar = ícone Pencil (1º botão da linha); excluir
 * = ícone Trash (2º) → ConfirmModal. Mocks STATEFUL (refetch via onChanged/onDone).
 */
const conn = (nodes: Array<Record<string, unknown>>) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
  totalCount: nodes.length,
});

// As 4 listas do catálogo; passe arrays (stateful) para a seção em teste.
const catalogLists = (over: {
  categories?: Array<Record<string, unknown>>;
  units?: Array<Record<string, unknown>>;
  labels?: Array<Record<string, unknown>>;
  taxRules?: Array<Record<string, unknown>>;
}) => ({
  SettingsProductCategories: () => ({
    product_categories: conn(over.categories ?? []),
  }),
  SettingsProductUnits: () => ({ productUnits: conn(over.units ?? []) }),
  SettingsProductUnitLabels: () => ({
    productUnitLabels: conn(over.labels ?? []),
  }),
  SettingsTaxRules: () => ({ taxRules: conn(over.taxRules ?? []) }),
});

test("catálogo: cria uma categoria", async ({ page }) => {
  const categories: Array<Record<string, unknown>> = [];
  await mockGraphql(page, {
    ...catalogLists({ categories }),
    CreateProductCategoryTab: (v) => {
      const input = (v.input ?? {}) as { name: string; segment: string };
      const node = { id: `cat-${categories.length + 1}`, ...input };
      categories.push(node);
      return {
        createProductCategory: {
          status: true,
          code: 200,
          message: "ok",
          data: node,
        },
      };
    },
  });

  await page.goto("/settings/catalog");
  await page.getByRole("button", { name: "Nova categoria" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.locator('input[name="name"]').fill("Cimento e argamassa");
  await dialog.locator('input[name="segment"]').fill("Estrutura");
  await dialog.getByRole("button", { name: "Cadastrar" }).click();

  await expect(
    page.getByText("Categoria cadastrada com sucesso")
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "Cimento e argamassa" })
  ).toBeVisible();
});

test("catálogo: edita uma categoria", async ({ page }) => {
  const categories = [{ id: "cat-1", name: "Tubos", segment: "Hidráulica" }];
  await mockGraphql(page, {
    ...catalogLists({ categories }),
    UpdateProductCategory: (v) => {
      const input = (v.input ?? {}) as { name?: string };
      const c = categories.find((x) => x.id === v.id);
      if (c && input.name) c.name = input.name;
      return {
        updateProductCategory: {
          status: true,
          code: 200,
          message: "ok",
          data: { id: v.id, ...input },
        },
      };
    },
  });

  await page.goto("/settings/catalog");

  const row = page.getByRole("row", { name: /Tubos/ });
  await row.getByRole("button").first().click(); // ícone Pencil (editar)

  const dialog = page.getByRole("dialog");
  await dialog.locator('input[name="name"]').fill("Tubos e conexões");
  await dialog.getByRole("button", { name: "Salvar" }).click();

  await expect(
    page.getByText("Categoria atualizada com sucesso")
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "Tubos e conexões" })
  ).toBeVisible();
});

test("catálogo: exclui uma categoria", async ({ page }) => {
  const categories = [{ id: "cat-1", name: "Categoria Velha", segment: "X" }];
  await mockGraphql(page, {
    ...catalogLists({ categories }),
    DeleteProductCategory: (v) => {
      const i = categories.findIndex((x) => x.id === v.id);
      if (i >= 0) categories.splice(i, 1);
      return { deleteProductCategory: { status: true, message: "ok" } };
    },
  });

  await page.goto("/settings/catalog");

  const row = page.getByRole("row", { name: /Categoria Velha/ });
  await row.getByRole("button").last().click(); // ícone Trash (excluir)

  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Excluir" })
    .click();

  await expect(page.getByText("Categoria removida com sucesso")).toBeVisible();
  await expect(page.getByText("Categoria Velha")).toHaveCount(0);
});

test("catálogo: cria uma unidade", async ({ page }) => {
  const units: Array<Record<string, unknown>> = [];
  await mockGraphql(page, {
    ...catalogLists({ units }),
    SettingsCreateProductUnit: (v) => {
      const input = (v.input ?? {}) as { label: string };
      const node = {
        id: `unit-${units.length + 1}`,
        label: input.label,
        isActive: true,
      };
      units.push(node);
      return {
        createProductUnit: {
          status: true,
          code: 200,
          message: "ok",
          data: node,
        },
      };
    },
  });

  await page.goto("/settings/catalog");
  await page.getByRole("button", { name: "Nova unidade" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.locator('input[name="label"]').fill("Saco");
  await dialog.getByRole("button", { name: "Criar" }).click();

  await expect(page.getByText("Unidade criada")).toBeVisible();
  await expect(page.getByRole("cell", { name: "Saco" })).toBeVisible();
});

test("catálogo: exclui uma unidade", async ({ page }) => {
  const units = [{ id: "unit-1", label: "Unidade Velha", isActive: true }];
  await mockGraphql(page, {
    ...catalogLists({ units }),
    SettingsDeleteProductUnit: (v) => {
      const i = units.findIndex((x) => x.id === v.id);
      if (i >= 0) units.splice(i, 1);
      return { deleteProductUnit: { status: true, message: "ok" } };
    },
  });

  await page.goto("/settings/catalog");

  const row = page.getByRole("row", { name: /Unidade Velha/ });
  await row.getByRole("button").last().click();

  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Remover" })
    .click();

  await expect(page.getByText("Unidade removida")).toBeVisible();
  await expect(page.getByText("Unidade Velha")).toHaveCount(0);
});

test("catálogo: cria um rótulo de embalagem", async ({ page }) => {
  const labels: Array<Record<string, unknown>> = [];
  await mockGraphql(page, {
    ...catalogLists({ labels }),
    SettingsCreateProductUnitLabel: (v) => {
      const input = (v.input ?? {}) as { label: string };
      const node = {
        id: `label-${labels.length + 1}`,
        label: input.label,
        isActive: true,
      };
      labels.push(node);
      return {
        createProductUnitLabel: {
          status: true,
          code: 200,
          message: "ok",
          data: node,
        },
      };
    },
  });

  await page.goto("/settings/catalog");
  await page.getByRole("button", { name: "Novo rótulo" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.locator('input[name="label"]').fill("Pallet");
  await dialog.getByRole("button", { name: "Criar" }).click();

  await expect(page.getByText("Rótulo criado")).toBeVisible();
  await expect(page.getByRole("cell", { name: "Pallet" })).toBeVisible();
});

test("catálogo: cria uma regra de imposto", async ({ page }) => {
  const taxRules: Array<Record<string, unknown>> = [];
  await mockGraphql(page, {
    ...catalogLists({ taxRules }),
    SettingsCreateTaxRule: (v) => {
      const input = (v.input ?? {}) as { name: string };
      const node = { id: `tax-${taxRules.length + 1}`, name: input.name };
      taxRules.push(node);
      return {
        createTaxRule: { status: true, code: 200, message: "ok", data: node },
      };
    },
  });

  await page.goto("/settings/catalog");
  await page.getByRole("button", { name: "Nova regra" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.locator('input[name="name"]').fill("IPI");
  await dialog.getByRole("button", { name: "Criar" }).click();

  await expect(page.getByText("Regra de imposto criada")).toBeVisible();
  await expect(page.getByRole("cell", { name: "IPI" })).toBeVisible();
});
