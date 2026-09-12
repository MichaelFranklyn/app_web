import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

/**
 * Ficha da rede de clientes (`/clients/networks/[id]`).
 *
 * A rede existe para responder "quanto esse grupo comprou" sem somar loja por
 * loja na mão — daí os três números do topo serem o que os testes prendem. As
 * lojas são a carteira recortada por `network_id`, o MESMO recorte do filtro da
 * lista de clientes: se os dois lugares divergirem, um deles está mentindo.
 */
const URL = "/clients/networks/net-1";

const rede = (overrides: Record<string, unknown> = {}) => ({
  id: "net-1",
  name: "Rede Horizonte",
  notes: "Grupo com 3 lojas em Salvador",
  isActive: true,
  storeCount: 2,
  invoicedAmount: "154000.00",
  lastOrderDate: "2026-09-05",
  ...overrides,
});

const loja = (overrides: Record<string, unknown> = {}) => ({
  id: "client-1",
  cnpj: "12345678000199",
  razaoSocial: "Central Horizonte ME",
  nomeFantasia: "Central Horizonte",
  addressCity: "Salvador",
  addressState: "BA",
  companyClient: {
    id: "cc-1",
    lastOrderDate: "2026-09-05",
    segment: { id: "seg-1", name: "Material de Construção" },
    sellers: [{ id: "seller-1", name: "Rafael Lima" }],
  },
  ...overrides,
});

const handlers = (
  network: Record<string, unknown> | null = rede(),
  stores: Record<string, unknown>[] = [loja()]
) => ({
  ClientNetworkDetail: () => ({
    clientNetwork: { status: true, message: "ok", data: network },
  }),
  ClientNetworkStores: () => ({
    network_stores: stores.length
      ? {
          edges: stores.map((node) => ({ node })),
          pageInfo: { hasNextPage: false, endCursor: null },
          totalCount: stores.length,
        }
      : emptyConnection(),
  }),
});

test("rede: consolida os números do grupo e lista as lojas", async ({
  page,
}) => {
  await mockGraphql(page, handlers());
  await page.goto(URL);

  await expect(page.getByText("Rede Horizonte")).toBeVisible();
  await expect(page.getByText("Grupo com 3 lojas em Salvador")).toBeVisible();
  await expect(page.getByText("R$ 154.000,00")).toBeVisible();
  await expect(page.getByText("05/09/2026").first()).toBeVisible();

  await expect(page.getByText("Central Horizonte").first()).toBeVisible();
  await expect(page.getByText("Salvador / BA")).toBeVisible();
  await expect(page.getByText("Material de Construção")).toBeVisible();
  await expect(page.getByText("Rafael Lima")).toBeVisible();
});

test("rede: as lojas pedem ao backend o recorte por network_id", async ({
  page,
}) => {
  // É o mesmo filtro da lista de clientes — é isso que faz os dois lugares
  // contarem a mesma coisa.
  const spy = await mockGraphql(page, handlers());
  await page.goto(URL);

  const variables = await spy.waitForCall("ClientNetworkStores");
  expect(variables.input).toEqual(
    expect.objectContaining({
      filters: expect.arrayContaining([
        { field: "network_id", operator: "eq", value: "net-1" },
      ]),
    })
  );
});

test("rede: a linha da loja abre a ficha do cliente na carteira", async ({
  page,
}) => {
  await mockGraphql(page, handlers());
  await page.goto(URL);

  // A rota do cliente é pelo id do VÍNCULO (companyClient), não pelo do
  // cadastro global. A linha inteira navega (não é um <a>): o clique é o teste.
  await page.getByRole("row").filter({ hasText: "Central Horizonte" }).click();

  await expect(page).toHaveURL(/\/clients\/cc-1$/);
});

test("rede: sem loja ligada, diz o que fazer para aparecer alguma", async ({
  page,
}) => {
  await mockGraphql(page, handlers(rede({ storeCount: 0 }), []));
  await page.goto(URL);

  await expect(page.getByText("Nenhuma loja nesta rede")).toBeVisible();
  await expect(
    page
      .getByText(
        "Abra a ficha de um cliente na carteira e escolha esta rede para ele aparecer aqui."
      )
      .first()
  ).toBeVisible();
});

test("rede: rede sem faturamento não inventa data de último pedido", async ({
  page,
}) => {
  await mockGraphql(
    page,
    handlers(rede({ invoicedAmount: "0.00", lastOrderDate: null }))
  );
  await page.goto(URL);

  await expect(page.getByText("R$ 0,00")).toBeVisible();
  await expect(page.getByText("—").first()).toBeVisible();
});
