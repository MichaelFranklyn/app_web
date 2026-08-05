import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

// ClientStats roda SERVER-SIDE (page.tsx) e é atendida pelo stub GraphQL;
// aqui mockamos apenas a query client-side da tabela.
test("clients: a carteira carrega vazia e renderiza o cabeçalho", async ({
  page,
}) => {
  await mockGraphql(page, {
    Clients: () => ({ clients_list: emptyConnection() }),
  });

  await page.goto("/clients");

  await expect(
    page.getByRole("heading", { name: "Clientes", level: 1 })
  ).toBeVisible();
});

test("clients: ordenar por Última Compra manda `last_order_date` ao backend", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    Clients: () => ({ clients_list: emptyConnection() }),
    ClientStats: () => ({
      clientStats: {
        totalClients: 0,
        activeClients: 0,
        atRiskClients: 0,
        noVisit30d: 0,
      },
    }),
  });

  await page.goto("/clients");
  await page
    .getByRole("columnheader", { name: "Última Compra" })
    .getByRole("button")
    .click();

  // `last_order_date` não é coluna de `clients`: o repositório a resolve numa
  // subconsulta que repete a regra da célula (cancelado fora, recorte por
  // vendedor). O que este teste prende é o front pedindo o nome certo.
  await expect
    .poll(() => JSON.stringify(spy.lastVariables("Clients") ?? {}))
    .toContain('"order":{"by":"last_order_date","dir":"desc"}');

  await expect(
    page.getByRole("columnheader", { name: "Última Compra" })
  ).toHaveAttribute("aria-sort", "descending");
});

test("clients: ordenar por Última Visita manda `last_visit_date` ao backend", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    Clients: () => ({ clients_list: emptyConnection() }),
    ClientStats: () => ({
      clientStats: {
        totalClients: 0,
        activeClients: 0,
        atRiskClients: 0,
        noVisit30d: 0,
      },
    }),
  });

  await page.goto("/clients");
  await page
    .getByRole("columnheader", { name: "Última Visita" })
    .getByRole("button")
    .click();

  await expect
    .poll(() => JSON.stringify(spy.lastVariables("Clients") ?? {}))
    .toContain('"order":{"by":"last_visit_date","dir":"desc"}');
});

test("clients: ordenar por Score manda `visit_score_total` ao backend", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    Clients: () => ({ clients_list: emptyConnection() }),
    ClientStats: () => ({
      clientStats: {
        totalClients: 0,
        activeClients: 0,
        atRiskClients: 0,
        noVisit30d: 0,
      },
    }),
  });

  await page.goto("/clients");
  await page
    .getByRole("columnheader", { name: "Score" })
    .getByRole("button")
    .click();

  // Score maior = mais urgente: o 1º clique tem de trazer o topo da fila.
  await expect
    .poll(() => JSON.stringify(spy.lastVariables("Clients") ?? {}))
    .toContain('"order":{"by":"visit_score_total","dir":"desc"}');
});

test("clients: Vendedor não vira botão de ordenação", async ({ page }) => {
  // Um cliente pode ter vários vendedores — não há "o vendedor" da linha. O que
  // prende isso aqui é a AUSÊNCIA de aria-sort: se alguém puser um sortKey sem
  // a subconsulta correspondente no repositório, a lista passaria a se ordenar
  // por `created_at` em silêncio.
  await mockGraphql(page, {
    Clients: () => ({ clients_list: emptyConnection() }),
    ClientStats: () => ({
      clientStats: {
        totalClients: 0,
        activeClients: 0,
        atRiskClients: 0,
        noVisit30d: 0,
      },
    }),
  });

  await page.goto("/clients");
  await expect(
    page.getByRole("columnheader", { name: "Vendedor" })
  ).not.toHaveAttribute("aria-sort");
});
