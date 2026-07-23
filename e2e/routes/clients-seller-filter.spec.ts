import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";
import { grantRole } from "../support/role";

/**
 * Filtro por vendedor + coluna de última compra na carteira (/clients).
 *
 * O seletor só existe para gestor (papel lido do cookie `userData` no servidor),
 * e o recorte vai para o backend como o filtro `seller_id` da CLIENTS_QUERY —
 * é isso que o teste afirma, não só que a tela reagiu.
 */
function clientNode(overrides: Record<string, unknown> = {}) {
  return {
    id: "client-1",
    cnpj: "12345678000199",
    razaoSocial: "Central Horizonte ME",
    nomeFantasia: "Central",
    cnae: "4744-0/99",
    cnaeDescription: "Comércio de materiais de construção",
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

  const vendedor = page.getByPlaceholder("Todos os vendedores");
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
  await expect(page.getByPlaceholder("Todos os vendedores")).toHaveCount(0);
});
