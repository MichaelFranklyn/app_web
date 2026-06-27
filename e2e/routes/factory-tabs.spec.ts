import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Lote 3 — abas do detalhe da fábrica (factories/[id]/{sellers,clients,import-template}).
 * Página SSR (CompanyFactoryDetail via stub). Cada aba dispara sua query client-side.
 * Linhas têm ícones de ação (Editar=Power/Pencil 1º, Excluir=Trash último).
 */
const base = "/factories/factory-1";
const conn = (nodes: Array<Record<string, unknown>>) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
  totalCount: nodes.length,
});

test("fábrica/vendedores: exclui um vínculo de acesso", async ({ page }) => {
  const accesses = [
    {
      id: "acc-1",
      isActive: true,
      createdAt: "2025-01-01T00:00:00Z",
      seller: {
        id: "seller-1",
        name: "Vendedor Vinculado",
        isActive: true,
        region: "SP",
        clientCount: 0,
        factoryCount: 1,
        totalRevenue: "0",
      },
      grantedByUser: { id: "u-1", name: "Admin" },
    },
  ];
  await mockGraphql(page, {
    FactorySellerAccesses: () => ({ factory_seller_accesses: conn(accesses) }),
    DeleteSellerFactoryAccess: () => ({
      deleteSellerFactoryAccess: { status: true, message: "ok" },
    }),
  });

  await page.goto(`${base}/sellers`);
  await page
    .getByRole("row", { name: /Vendedor Vinculado/ })
    .getByRole("button")
    .last()
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Excluir vínculo" })
    .click();

  await expect(page.getByText("Vínculo excluído com sucesso")).toBeVisible();
});

test("fábrica/clientes: desvincula um cliente", async ({ page }) => {
  const links = [
    {
      id: "link-1",
      priority: "HIGH",
      priceTierId: "tier-1",
      client: {
        id: "c-1",
        razaoSocial: "Cliente Vinculado LTDA",
        nomeFantasia: "Cliente Vinculado",
      },
      seller: { id: "s-1", name: "Vendedor" },
      priceTier: { id: "tier-1", name: "Varejo" },
    },
  ];
  await mockGraphql(page, {
    FactoryClientLinks: () => ({ factory_client_links: conn(links) }),
    UnlinkFactoryClient: () => ({
      deleteSellerClientFactory: { status: true, message: "ok" },
    }),
  });

  await page.goto(`${base}/clients`);
  await page
    .getByRole("row", { name: /Cliente Vinculado/ })
    .getByRole("button")
    .last()
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Desvincular" })
    .click();

  await expect(
    page.getByText("Cliente desvinculado com sucesso")
  ).toBeVisible();
});

test("fábrica/import: remove o modelo de pedido", async ({ page }) => {
  const templates = [
    {
      id: "tpl-1",
      factoryId: "factory-1",
      target: "ORDER",
      fileType: "PDF",
      parserStrategy: "prefix_dash",
      config: {},
      sampleFileUrl: null,
      version: 1,
      isActive: true,
    },
  ];
  await mockGraphql(page, {
    ImportTemplates: () => ({
      importTemplates: { edges: templates.map((node) => ({ node })) },
    }),
    DeleteImportTemplate: () => ({
      deleteImportTemplate: { status: true, message: "ok" },
    }),
  });

  await page.goto(`${base}/import-template`);
  await page.getByRole("button", { name: "Remover" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Remover modelo" })
    .click();

  await expect(page.getByText(/removido/i).first()).toBeVisible();
});
