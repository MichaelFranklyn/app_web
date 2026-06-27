import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Lote 3 — aba de tabelas de preço da fábrica (factories/[id]/price-lists).
 * A página renderiza PriceListsTab (FactoryPriceLists) + TiersTab (PriceTiers).
 * SSR via stub (CompanyFactoryDetail). Ícones: Editar(Pencil 1º), Excluir(Trash último).
 */
const base = "/factories/factory-1/price-lists";
const conn = (nodes: Array<Record<string, unknown>>) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
  totalCount: nodes.length,
});

test("fábrica/preços: cria uma tabela de preço", async ({ page }) => {
  const lists: Array<Record<string, unknown>> = [];
  await mockGraphql(page, {
    FactoryPriceLists: () => ({ factory_price_lists: conn(lists) }),
    PriceTiers: () => ({ price_tiers: conn([]) }),
    CreateFactoryPriceList: (v) => {
      const i = v.input as Record<string, unknown>;
      const node = {
        id: `pl-${lists.length + 1}`,
        name: i.name,
        region: i.region ?? null,
        validFrom: i.validFrom,
        validUntil: i.validUntil ?? null,
        isActive: true,
        clonedFromId: null,
      };
      lists.push(node);
      return {
        createFactoryPriceList: { status: true, message: "ok", data: node },
      };
    },
  });

  await page.goto(base);
  await page.getByRole("button", { name: "Nova tabela" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.locator('input[name="name"]').fill("Tabela 2026");
  await dialog
    .getByRole("textbox", { name: "Vigência início" })
    .click({ force: true });
  await page.getByRole("button", { name: "Hoje" }).click();
  await dialog.getByRole("button", { name: "Criar tabela" }).click();

  await expect(
    page.getByText("Tabela de preços criada com sucesso")
  ).toBeVisible();
});

test("fábrica/preços: remove uma tabela de preço", async ({ page }) => {
  const lists = [
    {
      id: "pl-1",
      name: "Tabela Velha",
      region: null,
      validFrom: "2026-01-01",
      validUntil: null,
      isActive: true,
      clonedFromId: null,
    },
  ];
  await mockGraphql(page, {
    FactoryPriceLists: () => ({ factory_price_lists: conn(lists) }),
    PriceTiers: () => ({ price_tiers: conn([]) }),
    DeleteFactoryPriceList: () => ({
      deleteFactoryPriceList: { status: true, message: "ok" },
    }),
  });

  await page.goto(base);
  await page
    .getByRole("row", { name: /Tabela Velha/ })
    .getByRole("button")
    .last()
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Remover" })
    .click();

  await expect(page.getByText("Tabela de preço removida")).toBeVisible();
});

test("fábrica/preços: edita uma tabela de preço", async ({ page }) => {
  const node = {
    id: "pl-1",
    name: "Tabela Editar",
    region: "NORDESTE",
    validFrom: "2026-01-01",
    validUntil: null,
    isActive: true,
    clonedFromId: null,
  };
  await mockGraphql(page, {
    FactoryPriceLists: () => ({ factory_price_lists: conn([node]) }),
    PriceTiers: () => ({ price_tiers: conn([]) }),
    UpdateFactoryPriceList: (v) => ({
      updateFactoryPriceList: {
        status: true,
        message: "ok",
        data: { ...node, ...(v.input as object) },
      },
    }),
  });

  await page.goto(base);
  await page
    .getByRole("row", { name: /Tabela Editar/ })
    .getByRole("button")
    .first()
    .click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Editar tabela de preço")).toBeVisible();
  // validFrom/isActive já vêm pré-preenchidos do nó; só renomeamos.
  await dialog.locator('input[name="name"]').fill("Tabela Renomeada");
  await dialog.getByRole("button", { name: "Salvar" }).click();

  await expect(
    page.getByText("Tabela de preço atualizada com sucesso")
  ).toBeVisible();
});

test("fábrica/preços: cria um nível comercial", async ({ page }) => {
  const tiers: Array<Record<string, unknown>> = [];
  await mockGraphql(page, {
    FactoryPriceLists: () => ({ factory_price_lists: conn([]) }),
    PriceTiers: () => ({ price_tiers: conn(tiers) }),
    CreatePriceTier: (v) => {
      const node = {
        id: `t-${tiers.length + 1}`,
        name: (v.input as { name: string }).name,
      };
      tiers.push(node);
      return { createPriceTier: { status: true, message: "ok", data: node } };
    },
  });

  await page.goto(base);
  await page.getByRole("button", { name: "Novo nível" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.locator('input[name="name"]').fill("Atacado");
  await dialog.getByRole("button", { name: "Criar nível" }).click();

  await expect(
    page.getByText("Nível comercial criado com sucesso")
  ).toBeVisible();
});

test("fábrica/preços: edita um nível comercial", async ({ page }) => {
  const tiers = [{ id: "t-1", name: "Nível Antigo" }];
  await mockGraphql(page, {
    FactoryPriceLists: () => ({ factory_price_lists: conn([]) }),
    PriceTiers: () => ({ price_tiers: conn(tiers) }),
    UpdatePriceTier: (v) => ({
      updatePriceTier: {
        status: true,
        message: "ok",
        data: { id: v.id, name: (v.input as { name: string }).name },
      },
    }),
  });

  await page.goto(base);
  await page
    .getByRole("row", { name: /Nível Antigo/ })
    .getByRole("button")
    .first()
    .click();

  const dialog = page.getByRole("dialog");
  await dialog.locator('input[name="name"]').fill("Nível Novo");
  await dialog.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Nível atualizado com sucesso")).toBeVisible();
});

test("fábrica/preços: remove um nível comercial", async ({ page }) => {
  const tiers = [{ id: "t-1", name: "Nível Velho" }];
  await mockGraphql(page, {
    FactoryPriceLists: () => ({ factory_price_lists: conn([]) }),
    PriceTiers: () => ({ price_tiers: conn(tiers) }),
    DeletePriceTier: () => ({
      deletePriceTier: { status: true, message: "ok" },
    }),
  });

  await page.goto(base);
  await page
    .getByRole("row", { name: /Nível Velho/ })
    .getByRole("button")
    .last()
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Remover" })
    .click();

  await expect(page.getByText("Nível removido")).toBeVisible();
});
