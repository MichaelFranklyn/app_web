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

test("fábrica/clientes: ordenar e filtrar acontecem sem ir ao servidor", async ({
  page,
}) => {
  const links = [
    ["link-1", "Zulmira Comércio", "s-1", "Ana", "alta"],
    ["link-2", "ácaro Materiais", "s-2", "Bruno", "baixa"],
    ["link-3", "Brito Depósito", "s-1", "Ana", "media"],
  ].map(([id, razaoSocial, sellerId, sellerName, priority]) => ({
    id,
    priority,
    priceTierId: null,
    lastInvoiceDate: null,
    client: { id: `c-${id}`, razaoSocial, nomeFantasia: null },
    seller: { id: sellerId, name: sellerName },
    priceTier: null,
  }));

  const spy = await mockGraphql(page, {
    FactoryClientLinks: () => ({ factory_client_links: conn(links) }),
  });

  await page.goto(`${base}/clients`);
  await expect(page.getByText("Zulmira Comércio")).toBeVisible();

  const callsBefore = spy.calls("FactoryClientLinks").length;

  // Ordenar por Cliente põe "ácaro" na frente: é o colator pt-BR trabalhando,
  // e não a ordem de código de caractere, que jogaria o acento para o fim.
  await page
    .getByRole("columnheader", { name: "Cliente" })
    .getByRole("button")
    .click();
  await expect(page.locator("tbody tr").first()).toContainText("ácaro");
  await expect(page).toHaveURL(/sortBy=client/);

  // Filtrar por vendedor deixa só as linhas do Bruno.
  await page.getByRole("button", { name: "Filtros" }).click();
  await page
    .locator("[data-filters-panel]")
    .getByPlaceholder("Todos os vendedores")
    .click();
  await page
    .locator("[data-select-dropdown]")
    .getByText("Bruno", { exact: true })
    .click();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody tr").first()).toContainText("ácaro");

  // O ponto da tabela local: nada disso encostou na rede.
  expect(spy.calls("FactoryClientLinks").length).toBe(callsBefore);
});
