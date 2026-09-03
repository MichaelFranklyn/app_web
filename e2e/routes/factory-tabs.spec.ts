import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Lote 3 — abas do detalhe da fábrica (factories/[id]/{sellers,clients,import-template}).
 * Página SSR (CompanyFactoryDetail via stub). Cada aba dispara sua query client-side.
 * Linhas têm ícones de ação (Editar=Power/Pencil 1º, Excluir=Trash último) —
 * menos a de vendedores, onde as ações do vínculo ficam num menu "Mais ações".
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
      sellerCommissionRate: "3",
      sellerCommissionBasis: null,
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
  // As três ações do vínculo (comissão, suspender, excluir) moram num menu só —
  // o mesmo que o perfil da pessoa usa do outro lado do vínculo.
  await page
    .getByRole("row", { name: /Vendedor Vinculado/ })
    .getByRole("button", { name: "Mais ações" })
    .click();
  await page.getByRole("menuitem", { name: "Excluir vínculo" }).click();
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

/**
 * A aba baixava os 50 primeiros vínculos e fazia ordem, busca e filtro em
 * memória — e havia aqui um teste que travava justamente isso ("nada disso
 * encostou na rede").
 *
 * Era o contrato errado: numa fábrica com carteira grande, ordenar por Cliente
 * ordenava as 50 linhas baixadas (não a carteira), e o filtro de Vendedor só
 * oferecia quem aparecia nelas. Agora quem ordena, filtra e pagina é o banco —
 * e o que estes testes prendem é o front pedindo os nomes de coluna certos.
 */
const clientLinks = [
  ["link-1", "Zulmira Comércio", "s-1", "Ana", "alta"],
  ["link-2", "Ácaro Materiais", "s-2", "Bruno", "baixa"],
].map(([id, razaoSocial, sellerId, sellerName, priority]) => ({
  id,
  priority,
  priceTierId: null,
  lastInvoiceDate: null,
  client: { id: `c-${id}`, razaoSocial, nomeFantasia: null },
  seller: { id: sellerId, name: sellerName },
  priceTier: null,
}));

test("fábrica/clientes: ordenar por Cliente vai ao banco como `client_name`", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    FactoryClientLinks: () => ({ factory_client_links: conn(clientLinks) }),
  });

  await page.goto(`${base}/clients`);
  await expect(page.getByText("Zulmira Comércio")).toBeVisible();

  await page
    .getByRole("columnheader", { name: "Cliente" })
    .getByRole("button")
    .click();

  // `client_name` não é coluna do vínculo (que guarda só o `client_id`): o
  // repositório a traduz num join até a tabela de clientes. O que este teste
  // prende é o NOME pedido — um nome fora da lista permitida seria ignorado, e
  // a lista voltaria à ordem do banco sem nada na tela dizer.
  await expect
    .poll(() => JSON.stringify(spy.lastVariables("FactoryClientLinks") ?? {}))
    .toContain('"order":{"by":"client_name","dir":"asc"}');
});

test("fábrica/clientes: filtrar por vendedor vai ao banco como `seller_id`", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    FactoryClientLinks: () => ({ factory_client_links: conn(clientLinks) }),
    // As opções do filtro não saem mais das linhas da página: vêm de quem tem
    // acesso à fábrica, então um vendedor sem vínculo na 1ª página aparece.
    FactoryOrderFilterSellers: () => ({
      factory_order_sellers: conn([
        { id: "acc-9", isActive: true, seller: { id: "s-9", name: "Bruno" } },
      ]),
    }),
  });

  await page.goto(`${base}/clients`);
  await expect(page.getByText("Zulmira Comércio")).toBeVisible();

  await page.getByRole("button", { name: "Filtros" }).click();
  await page
    .locator("[data-filters-panel]")
    .getByPlaceholder("Todos os vendedores")
    .click();
  await page
    .locator("[data-select-dropdown]")
    .getByText("Bruno", { exact: true })
    .click();

  await expect
    .poll(() => JSON.stringify(spy.lastVariables("FactoryClientLinks") ?? {}))
    .toContain('{"field":"seller_id","operator":"eq","value":"s-9"}');
});

test("fábrica/clientes: filtrar por prioridade leva junto a grafia legada", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    FactoryClientLinks: () => ({ factory_client_links: conn(clientLinks) }),
  });

  await page.goto(`${base}/clients`);
  await expect(page.getByText("Zulmira Comércio")).toBeVisible();

  await page.getByRole("button", { name: "Filtros" }).click();
  await page
    .locator("[data-filters-panel]")
    .getByPlaceholder("Todas as prioridades")
    .click();
  await page
    .locator("[data-select-dropdown]")
    .getByText("Alta", { exact: true })
    .click();

  // Os vínculos antigos guardam "high"; o vocabulário de hoje é "alta". Com um
  // valor só, filtrar por Alta esconderia esses registros — e esconderia calado.
  await expect
    .poll(() => JSON.stringify(spy.lastVariables("FactoryClientLinks") ?? {}))
    .toContain('{"field":"priority","operator":"in","values":["alta","high"]}');
});

/**
 * A aba de pedidos tinha o mesmo defeito da de clientes: 50 pedidos baixados e
 * ordem, filtro e paginação em memória. Numa fábrica com movimento, "ordenar
 * por Valor" respondia sobre as 50 linhas à mão — não sobre a fábrica.
 */
const factoryOrders = [
  {
    id: "order-0000000001",
    orderDate: "2026-05-10",
    totalAmount: "1500.00",
    commissionAmount: "75.00",
    status: "INVOICED",
    notes: null,
    seller: { id: "s-1", name: "Ana" },
    client: { id: "c-1", razaoSocial: "Mercado Central", nomeFantasia: null },
  },
];

test("fábrica/pedidos: ordenar por Valor vai ao banco como `total_amount`", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    FactoryOrders: () => ({ factory_orders: conn(factoryOrders) }),
  });

  await page.goto(`${base}/orders`);
  await expect(page.getByText("Mercado Central")).toBeVisible();

  await page
    .getByRole("columnheader", { name: "Valor" })
    .getByRole("button")
    .click();

  // Maior primeiro no 1º clique: quem clica em "Valor" quer o maior pedido.
  await expect
    .poll(() => JSON.stringify(spy.lastVariables("FactoryOrders") ?? {}))
    .toContain('"order":{"by":"total_amount","dir":"desc"}');
});

test("fábrica/pedidos: a lista sai escopada na fábrica e paginada", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    FactoryOrders: () => ({ factory_orders: conn(factoryOrders) }),
  });

  await page.goto(`${base}/orders`);
  await expect(page.getByText("Mercado Central")).toBeVisible();

  const vars = JSON.stringify(spy.lastVariables("FactoryOrders") ?? {});
  // O escopo da aba continua sendo um filtro do backend...
  expect(vars).toContain('{"field":"factory_id","operator":"eq"');
  // ...e a página deixou de ser um teto de 50 sem rodapé.
  expect(vars).toContain('"first":10');
  await expect(page.getByText(/1 pedido\(s\) · página 1 de 1/)).toBeVisible();
});

test("fábrica/pedidos: pedido faturado aparece por extenso, em português", async ({
  page,
}) => {
  await mockGraphql(page, {
    FactoryOrders: () => ({ factory_orders: conn(factoryOrders) }),
  });

  await page.goto(`${base}/orders`);

  // O mapa de status local desta pasta não conhecia INVOICED: a tag saía com a
  // palavra crua, em inglês, na cor de "sem situação".
  await expect(page.getByText("Faturado")).toBeVisible();
  await expect(page.getByText("INVOICED")).toHaveCount(0);
});
