import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

/**
 * A carteira no perfil da pessoa (/settings/users/[id] → "Carteira de clientes").
 *
 * Ela mostrava os 50 primeiros vínculos numa tabela sem página, busca nem
 * ordenação — numa carteira real (as de produção passam de 50) o que ficasse
 * fora dessas linhas não tinha como ser alcançado. Agora página, ordem e
 * filtros são resolvidos no BANCO, e é isso que estes testes prendem: o que a
 * tela pede ao servidor.
 */
const userWithSeller = {
  user_detail: {
    status: true,
    message: "ok",
    data: {
      id: "u-9",
      name: "Vendedor Carteira",
      email: "vc@empresa.com.br",
      role: "SELLER",
      isActive: true,
      phone: null,
      cpf: null,
      birthDate: null,
      addressZip: null,
      addressStreet: null,
      addressNumber: null,
      addressComplement: null,
      addressNeighborhood: null,
      addressCity: null,
      addressState: null,
      createdAt: "2026-01-01T00:00:00Z",
      company: {
        id: "c-1",
        nomeFantasia: "Empresa Teste",
        razaoSocial: "Empresa Teste LTDA",
      },
      seller: {
        id: "seller-9",
        name: "Vendedor Carteira",
        region: "BA",
        isActive: true,
        factoryCount: 1,
        clientCount: 12,
        totalRevenue: "0",
        lastOrderDate: null,
        scheduleConfig: null,
      },
    },
  },
};

const link = (id: string, razaoSocial: string) => ({
  id,
  priority: "alta",
  visitFrequencyDays: 30,
  lastVisitDate: "2026-08-01",
  createdAt: "2026-01-01T00:00:00Z",
  client: { id: `c-${id}`, razaoSocial, nomeFantasia: null },
  factory: {
    id: "factory-1",
    nomeFantasia: "Fábrica Um",
    nickname: null,
    razaoSocial: "Fábrica Um LTDA",
  },
});

/** Uma página de 10 num total de 12: é o segundo lote que não existia antes. */
const wallet = {
  seller_clients: {
    edges: [link("l-1", "ALFA MATERIAIS"), link("l-2", "BETA CONSTRUCOES")].map(
      (node) => ({ node })
    ),
    pageInfo: { hasNextPage: true, endCursor: null },
    totalCount: 12,
  },
};

const baseMocks = {
  UserDetail: () => userWithSeller,
  SellerFactoryAccesses: () => ({ seller_accesses: emptyConnection() }),
  SellerClientLinks: () => wallet,
};

test("carteira: pagina no servidor e conta a carteira inteira", async ({
  page,
}) => {
  await mockGraphql(page, baseMocks);

  await page.goto("/settings/users/u-9");

  await expect(page.getByText("ALFA MATERIAIS")).toBeVisible();
  // O rodapé é o que faltava: sem ele, 12 clientes cabiam em 2 linhas na tela
  // e ninguém sabia que havia mais.
  await expect(page.getByText("12 cliente(s) · página 1 de 2")).toBeVisible();
});

test("carteira: buscar cliente vai ao banco como `client_name`", async ({
  page,
}) => {
  const spy = await mockGraphql(page, baseMocks);

  await page.goto("/settings/users/u-9");
  await expect(page.getByText("ALFA MATERIAIS")).toBeVisible();

  await page.getByRole("button", { name: "Filtros" }).click();
  await page
    .locator("[data-filters-panel]")
    .getByPlaceholder("Razão social ou nome fantasia")
    .fill("BETA");

  // `client_name` não é coluna do vínculo: o repositório o traduz num
  // `client_id IN (SELECT ...)` sobre razão social e nome fantasia.
  await expect
    .poll(() => JSON.stringify(spy.lastVariables("SellerClientLinks") ?? {}))
    .toContain('"field":"client_name"');
});

test("carteira: ordenar por Cliente vai ao banco, não em memória", async ({
  page,
}) => {
  const spy = await mockGraphql(page, baseMocks);

  await page.goto("/settings/users/u-9");
  await expect(page.getByText("ALFA MATERIAIS")).toBeVisible();

  await page
    .getByRole("columnheader", { name: "Cliente" })
    .getByRole("button")
    .click();

  await expect
    .poll(() => JSON.stringify(spy.lastVariables("SellerClientLinks") ?? {}))
    .toContain('"order":{"by":"client_name","dir":"asc"}');
});
