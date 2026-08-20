import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

test("users: a lista carrega vazia e mostra o botão de criar", async ({
  page,
}) => {
  await mockGraphql(page, {
    Users: () => ({ users_list: emptyConnection() }),
    SellerFactoryAccessList: () => ({
      seller_factory_access_list: emptyConnection(),
    }),
  });

  await page.goto("/settings/users");

  await expect(
    page.getByRole("button", { name: /nova pessoa/i })
  ).toBeVisible();
});

/**
 * A lista de pessoas não ordenava por nada: chegava na ordem crua do banco e
 * não havia como pedir outra. Agora quem ordena é o banco, sobre a empresa
 * inteira — ordenar em memória alinharia só as dez linhas abertas, e "a pessoa
 * mais antiga" seria a mais antiga da página.
 */
const people = [
  {
    id: "u-1",
    name: "Zulmira Alves",
    email: "zulmira@empresa.com",
    role: "ADMIN",
    isActive: true,
    phone: null,
    createdAt: "2026-01-10T00:00:00Z",
    seller: null,
  },
];

const conn = (nodes: Array<Record<string, unknown>>) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
  totalCount: nodes.length,
});

test("users: ordenar por Pessoa vai ao banco como `name`", async ({ page }) => {
  const spy = await mockGraphql(page, {
    Users: () => ({ users_list: conn(people) }),
    SellerFactoryAccessList: () => ({
      seller_factory_access_list: emptyConnection(),
    }),
  });

  await page.goto("/settings/users");
  await expect(page.getByText("Zulmira Alves")).toBeVisible();

  await page
    .getByRole("columnheader", { name: "Pessoa" })
    .getByRole("button")
    .click();

  await expect
    .poll(() => JSON.stringify(spy.lastVariables("Users") ?? {}))
    .toContain('"order":{"by":"name","dir":"asc"}');
});

test("users: ordenar por Desde vai ao banco como `created_at`", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    Users: () => ({ users_list: conn(people) }),
    SellerFactoryAccessList: () => ({
      seller_factory_access_list: emptyConnection(),
    }),
  });

  await page.goto("/settings/users");
  await expect(page.getByText("Zulmira Alves")).toBeVisible();

  // Mais recente primeiro no 1º clique: quem clica em "Desde" quer ver quem
  // entrou por último.
  await page
    .getByRole("columnheader", { name: "Desde" })
    .getByRole("button")
    .click();

  await expect
    .poll(() => JSON.stringify(spy.lastVariables("Users") ?? {}))
    .toContain('"order":{"by":"created_at","dir":"desc"}');
});

test("users: exportar baixa a lista inteira, não a página aberta", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    Users: () => ({ users_list: conn(people) }),
    SellerFactoryAccessList: () => ({
      seller_factory_access_list: emptyConnection(),
    }),
  });

  await page.goto("/settings/users");
  await expect(page.getByText("Zulmira Alves")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /exportar/i }).click();
  await downloadPromise;

  // A lista pagina de dez em dez, e o export lia o que estava em memória: numa
  // empresa de quarenta pessoas o arquivo saía com dez, sem nada avisando. A
  // consulta do export pede uma página larga, à parte da que a tela mostra.
  // `calls` já são as variáveis de cada chamada, na ordem em que saíram.
  const calls = spy.calls("Users");
  expect(JSON.stringify(calls.at(-1) ?? {})).toContain('"first":100');
});
