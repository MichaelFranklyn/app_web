import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";
import { grantRole } from "../support/role";

/**
 * Painel de filtros + coluna de última compra na carteira (/clients).
 *
 * O campo de vendedor só existe para gestor (papel lido do cookie `userData` no
 * servidor), e o recorte vai para o backend como o filtro `seller_id` da
 * CLIENTS_QUERY — é isso que o teste afirma, não só que a tela reagiu.
 */
function clientNode(overrides: Record<string, unknown> = {}) {
  return {
    id: "client-1",
    cnpj: "12345678000199",
    razaoSocial: "Central Horizonte ME",
    nomeFantasia: "Central",
    addressCity: "Salvador",
    addressState: "BA",
    isNeedsAttention: false,
    attentionReason: null,
    companyClient: {
      id: "cc-1",
      visitScoreTotal: null,
      lastOrderDate: "2026-06-26",
      lastVisitDate: "2026-06-19",
      sellers: [
        { id: "seller-1", name: "Rafael Lima" },
        { id: "seller-2", name: "Mariana Souza" },
      ],
    },
    ...overrides,
  };
}

test("clients: gestor filtra por vendedor e vê a data da última compra", async ({
  page,
}) => {
  await grantRole(page, "OWNER");

  const spy = await mockGraphql(page, {
    Clients: () => ({
      clients_list: {
        edges: [{ node: clientNode() }],
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: 1,
      },
    }),
    ClientsSellers: () => ({
      clients_sellers: {
        edges: [
          { node: { id: "seller-1", name: "Rafael Lima" } },
          { node: { id: "seller-2", name: "Mariana Souza" } },
        ],
      },
    }),
    ClientStats: () => ({
      clientStats: {
        totalClients: 1,
        activeClients: 1,
        atRiskClients: 0,
        noVisit30d: 0,
      },
    }),
  });

  await page.goto("/clients");

  // Data pura do backend ("2026-06-26") não pode recuar um dia no fuso do Brasil.
  await expect(page.getByText("26/06/2026")).toBeVisible();

  // Antes de filtrar, a linha abre pelo 1º vendedor do vínculo.
  const linha = page.getByRole("row").filter({ hasText: "Central Horizonte" });
  await expect(linha).toContainText("Rafael Lima");

  // Os filtros vivem num painel: primeiro o botão, depois o campo.
  await page.getByRole("button", { name: "Filtros" }).click();

  const vendedor = page
    .locator("[data-filters-panel]")
    .getByPlaceholder("Todos os vendedores");
  await vendedor.click();
  await page
    .locator("[data-select-dropdown]")
    .getByText("Mariana Souza", { exact: true })
    .click();

  // O recorte tem de chegar ao backend como filtro `seller_id`.
  await expect
    .poll(() => {
      const input = spy.lastVariables("Clients")?.input as
        | { filters?: { field: string; value: string }[] }
        | undefined;
      return input?.filters?.find((f) => f.field === "seller_id")?.value;
    })
    .toBe("seller-2");

  // E a coluna passa a abrir pelo vendedor filtrado, não por outro do vínculo.
  await expect(linha).toContainText("Mariana Souza");
});

test("clients: filtrar por estado vai ao backend como address_state", async ({
  page,
}) => {
  await grantRole(page, "OWNER");

  const spy = await mockGraphql(page, {
    Clients: () => ({
      clients_list: {
        edges: [{ node: clientNode() }],
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: 1,
      },
    }),
    ClientsSellers: () => ({ clients_sellers: { edges: [] } }),
    ClientStats: () => ({
      clientStats: {
        totalClients: 1,
        activeClients: 1,
        atRiskClients: 0,
        noVisit30d: 0,
      },
    }),
  });

  await page.goto("/clients");
  await expect(page.getByText("Central Horizonte ME")).toBeVisible();

  await page.getByRole("button", { name: "Filtros" }).click();

  // Digitar reduz as 27 UFs a uma: a lista inteira não cabe na altura da tela.
  const estado = page
    .locator("[data-filters-panel]")
    .getByPlaceholder("Todos os estados");
  await estado.click();
  await estado.fill("BA");
  await page
    .locator("[data-select-dropdown]")
    .getByText("BA", { exact: true })
    .click();

  await expect
    .poll(() => {
      const input = spy.lastVariables("Clients")?.input as
        | { filters?: { field: string; value: string }[] }
        | undefined;
      return input?.filters?.find((f) => f.field === "address_state")?.value;
    })
    .toBe("BA");

  // O botão passa a dizer quantos filtros estão valendo.
  await expect(page.getByRole("button", { name: "Filtros (1)" })).toBeVisible();
});

test("clients: vendedor não vê o seletor de vendedor (já vê só a sua carteira)", async ({
  page,
}) => {
  await grantRole(page, "SELLER");

  await mockGraphql(page, {
    Clients: () => ({
      clients_list: {
        edges: [{ node: clientNode() }],
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: 1,
      },
    }),
  });

  await page.goto("/clients");

  await expect(page.getByText("Central Horizonte ME")).toBeVisible();

  // O painel existe (busca, estado, cadastro), mas sem o campo de vendedor:
  // escolher "de quem" não faz sentido para quem só vê a própria carteira.
  await page.getByRole("button", { name: "Filtros" }).click();
  const painel = page.locator("[data-filters-panel]");
  await expect(painel.getByPlaceholder("Todos os estados")).toBeVisible();
  await expect(painel.getByPlaceholder("Todos os vendedores")).toHaveCount(0);
});

test("clients: a busca por nome mora no painel e vai como filtro da query", async ({
  page,
}) => {
  await grantRole(page, "OWNER");

  const spy = await mockGraphql(page, {
    Clients: () => ({
      clients_list: {
        edges: [{ node: clientNode() }],
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: 1,
      },
    }),
    ClientsSellers: () => ({ clients_sellers: { edges: [] } }),
    ClientStats: () => ({
      clientStats: {
        totalClients: 1,
        activeClients: 1,
        atRiskClients: 0,
        noVisit30d: 0,
      },
    }),
  });

  await page.goto("/clients");
  await expect(page.getByText("Central Horizonte ME")).toBeVisible();

  // Fora do painel não sobrou campo de busca nenhum no cabeçalho da tabela.
  await expect(
    page.getByPlaceholder("Razão social ou nome fantasia")
  ).toHaveCount(0);

  await page.getByRole("button", { name: "Filtros" }).click();
  await page
    .locator("[data-filters-panel]")
    .getByPlaceholder("Razão social ou nome fantasia")
    .fill("Horizonte");

  await expect
    .poll(() => {
      const input = spy.lastVariables("Clients")?.input as
        | { filters?: { field: string; value: string }[] }
        | undefined;
      return input?.filters?.find(
        (f) => f.field === "razao_social,nome_fantasia"
      )?.value;
    })
    .toBe("Horizonte");

  // Estando no painel, a busca conta como filtro ativo no botão.
  await expect(page.getByRole("button", { name: "Filtros (1)" })).toBeVisible();
});
