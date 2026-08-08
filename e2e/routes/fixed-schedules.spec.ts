import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

/**
 * Dias fixos: a agenda que o sistema NÃO decide.
 *
 * O que estes testes protegem não é o CRUD — é o que a tela precisa dizer sobre
 * um compromisso: quando ele cai (as próximas datas, porque "quinzenal na
 * terça" não diz se a próxima é dia 11 ou 18) e por que ele foi recusado
 * (a jornada não comporta, os clientes estão em pontas opostas). A recusa é uma
 * decisão a tomar ali mesmo, e um toast que some é o pior lugar para ela.
 */

const perfilComVendedor = () => ({
  user_detail: {
    status: true,
    message: "ok",
    data: {
      id: "u-1",
      name: "Celso",
      email: "celso@empresa.com.br",
      role: "SELLER",
      isActive: true,
      phone: "71999990000",
      cpf: "11144477735",
      birthDate: null,
      addressZip: null,
      addressStreet: null,
      addressNumber: null,
      addressComplement: null,
      addressNeighborhood: null,
      addressCity: "Salvador",
      addressState: "BA",
      createdAt: "2025-01-01T00:00:00Z",
      company: {
        id: "c-1",
        nomeFantasia: "Empresa Teste",
        razaoSocial: "Empresa Teste LTDA",
      },
      seller: {
        id: "seller-1",
        name: "Celso",
        region: "Bahia",
        isActive: true,
        factoryCount: 1,
        clientCount: 2,
        totalRevenue: "0",
        lastOrderDate: null,
        scheduleConfig: null,
      },
    },
  },
});

const compromisso = (over: Record<string, unknown> = {}) => ({
  // O `__typename` não é decoração: a query usa fragmento
  // (`... on FixedScheduleType`), e sem o tipo no payload o Apollo não casa o
  // fragmento e devolve o nó sem nenhum campo dele.
  __typename: "FixedScheduleType",
  id: "fx-1",
  clientId: "cli-1",
  weekday: 2,
  intervalWeeks: 2,
  startsOn: "2026-08-11",
  endsOn: null,
  isActive: true,
  notes: "O comprador só atende pela manhã",
  nextOccurrences: ["2026-08-11", "2026-08-25", "2026-09-08"],
  client: {
    id: "cli-1",
    razaoSocial: "Eguiberto Cardoso Pereira",
    nomeFantasia: null,
  },
  ...over,
});

const carteira = () => ({
  sellerClientFactoryList: {
    edges: [
      {
        node: {
          id: "scf-9",
          clientId: "cli-9",
          client: {
            id: "cli-9",
            razaoSocial: "Nosso Lar Materiais LTDA",
            nomeFantasia: "Nosso Lar",
          },
        },
      },
    ],
  },
});

/** Escolhe uma opção num select do FormBuilder (placeholder → dropdown). */
async function escolher(
  page: import("@playwright/test").Page,
  placeholder: string,
  opcao: string
) {
  await page.getByPlaceholder(placeholder).click();
  await page
    .locator("[data-select-dropdown]")
    .getByText(opcao, { exact: true })
    .click();
}

const baseHandlers = {
  UserDetail: () => perfilComVendedor(),
  SellerFactoryAccesses: () => ({ seller_accesses: emptyConnection() }),
  SellerClientLinks: () => ({ seller_clients: emptyConnection() }),
};

test("dias fixos: a tabela mostra a cadência e as próximas datas", async ({
  page,
}) => {
  await mockGraphql(page, {
    ...baseHandlers,
    FixedSchedules: () => ({
      fixedSchedules: { edges: [{ node: compromisso() }], totalCount: 1 },
    }),
  });

  await page.goto("/settings/user/u-1");

  const secao = page
    .locator("section, div")
    .filter({ hasText: "Dias fixos" })
    .first();
  await expect(secao).toBeVisible();

  await expect(page.getByText("Eguiberto Cardoso Pereira")).toBeVisible();
  // A cadência dita por extenso: "quinzenal" sozinho não diz o dia.
  await expect(page.getByText("Terça-feira, de 15 em 15 dias")).toBeVisible();
  // E as datas de verdade, para o gestor conferir que entendeu o mesmo que o
  // sistema. 11/08/2026 é uma terça — se a formatação passasse por `new Date`,
  // o fuso do Brasil mostraria 10/08 aqui.
  await expect(page.getByText("11/08 · 25/08 · 08/09")).toBeVisible();
});

test("dias fixos: marcar um dia envia o compromisso", async ({ page }) => {
  const spy = await mockGraphql(page, {
    ...baseHandlers,
    FixedSchedules: () => ({ fixedSchedules: { edges: [], totalCount: 0 } }),
    FixedScheduleWalletClients: () => carteira(),
    CreateFixedSchedule: () => ({
      createFixedSchedule: {
        status: true,
        message: "ok",
        data: compromisso({ id: "fx-novo" }),
      },
    }),
  });

  await page.goto("/settings/user/u-1");

  await expect(page.getByText("Nenhum dia fixo marcado")).toBeVisible();
  await page.getByRole("button", { name: "Marcar dia fixo" }).click();

  await escolher(page, "Selecione o cliente", "Nosso Lar Materiais LTDA");
  await escolher(page, "Selecione o dia", "Terça-feira");
  await escolher(page, "Selecione a frequência", "De 15 em 15 dias");

  await page.getByRole("button", { name: "Marcar dia" }).click();

  const variables = await spy.waitForCall("CreateFixedSchedule");
  expect(variables.input).toMatchObject({
    sellerId: "seller-1",
    clientId: "cli-9",
    weekday: 2,
    intervalWeeks: 2,
  });
});

test("dias fixos: a recusa do backend fica na tela, com o motivo", async ({
  page,
}) => {
  await mockGraphql(page, {
    ...baseHandlers,
    FixedSchedules: () => ({ fixedSchedules: { edges: [], totalCount: 0 } }),
    FixedScheduleWalletClients: () => carteira(),
  });

  // O `mockGraphql` sempre responde 200 com `data`, e a recusa do backend é um
  // ERRO GraphQL (ConflictException). Esta rota entra depois e tem prioridade;
  // o que não for `CreateFixedSchedule` cai de volta no mock geral.
  const motivo =
    "Os compromissos fixos deste dia não cabem na jornada: ela estouraria em 1h07. Escolha outro dia da semana para este cliente ou reveja os compromissos já marcados.";
  await page.route("**/graphql", async (route) => {
    const body = route.request().postDataJSON() as { operationName?: string };
    if (body?.operationName !== "CreateFixedSchedule") return route.fallback();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ errors: [{ message: motivo }], data: null }),
    });
  });

  await page.goto("/settings/user/u-1");
  await page.getByRole("button", { name: "Marcar dia fixo" }).click();

  await escolher(page, "Selecione o cliente", "Nosso Lar Materiais LTDA");
  await escolher(page, "Selecione o dia", "Quinta-feira");
  await escolher(page, "Selecione a frequência", "Toda semana");

  await page.getByRole("button", { name: "Marcar dia" }).click();

  // O motivo fica DENTRO do modal, que continua aberto: o gestor precisa dele
  // na tela enquanto escolhe outro dia.
  await expect(
    page.getByText("Este dia não comporta o compromisso")
  ).toBeVisible();
  await expect(page.getByText(motivo)).toBeVisible();
  await expect(page.getByRole("button", { name: "Marcar dia" })).toBeVisible();
});
