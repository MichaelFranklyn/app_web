import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Atendimentos: a fila do escritório e o caso aberto.
 *
 * O que estes testes guardam é o que faz a tela existir: a fila precisa dizer de
 * QUEM é a bola (a situação) e há quanto tempo o cliente espera, e o caso
 * precisa registrar o andamento JUNTO com a mudança de situação — separados, a
 * linha do tempo vira um status sem história.
 */
/**
 * `__typename` NÃO é decoração: a query compartilhada usa fragmento
 * (`...SupportCaseRow on ClientSupportCaseType`), e sem o tipo na resposta o
 * Apollo não casa o fragmento — a linha renderiza inteira em branco, que foi
 * exatamente o que aconteceu quando este mock não o trazia.
 */
const supportCase = (overrides: Record<string, unknown> = {}) => ({
  __typename: "ClientSupportCaseType",
  id: "case-1",
  title: "Chegaram 3 caixas quebradas",
  category: "MERCHANDISE",
  status: "WAITING_FACTORY",
  priority: "HIGH",
  amount: "840.50",
  reportedAt: "2026-08-28",
  resolvedAt: null,
  ageDays: 6,
  isOpen: true,
  clientId: "client-1",
  client: {
    id: "client-1",
    razaoSocial: "ADILSON MATERIAIS LTDA",
    nomeFantasia: "Nossa Loja",
  },
  factory: {
    id: "f-1",
    razaoSocial: "HERC LTDA",
    nomeFantasia: "HERC",
    nickname: null,
  },
  seller: { id: "seller-1", name: "Celso" },
  assignedTo: null,
  lastUpdate: {
    __typename: "ClientSupportUpdateType",
    id: "upd-1",
    caseId: "case-1",
    kind: "CONTACT_FACTORY",
    body: "Cobrei a fábrica de novo.",
    statusFrom: null,
    statusTo: null,
    createdAt: "2026-09-01T12:00:00Z",
    author: { id: "u-1", name: "Calazans" },
  },
  createdAt: "2026-08-28T12:00:00Z",
  ...overrides,
});

const queue = (nodes: unknown[]) => ({
  support_cases: {
    edges: nodes.map((node) => ({ node })),
    pageInfo: { hasNextPage: false, endCursor: null },
    totalCount: nodes.length,
  },
});

const counts = () => ({
  clientSupportCounts: [
    { status: "OPEN", count: 2 },
    { status: "IN_PROGRESS", count: 1 },
    { status: "WAITING_FACTORY", count: 3 },
    { status: "WAITING_CLIENT", count: 0 },
    { status: "RESOLVED", count: 9 },
    { status: "CANCELLED", count: 0 },
  ],
});

test("support: a fila mostra a situação e há quanto tempo o cliente espera", async ({
  page,
}) => {
  await mockGraphql(page, {
    ClientSupportCases: () => queue([supportCase()]),
    ClientSupportCounts: () => counts(),
  });
  await page.goto("/support");

  await expect(
    page.getByRole("heading", { name: "Atendimentos do cliente", level: 1 })
  ).toBeVisible();
  await expect(page.getByText("Chegaram 3 caixas quebradas")).toBeVisible();
  await expect(page.getByText("Aguardando a fábrica").first()).toBeVisible();
  await expect(page.getByText("6 dias esperando")).toBeVisible();
});

test("support: os cartões do topo vêm do servidor, não da página aberta", async ({
  page,
}) => {
  // A fila é paginada: somar a página diria "1 aberto" numa empresa com três.
  await mockGraphql(page, {
    ClientSupportCases: () => queue([supportCase()]),
    ClientSupportCounts: () => counts(),
  });
  await page.goto("/support");

  // A fila trouxe UMA linha; os cartões mostram os números da empresa inteira.
  await expect(page.getByText("Aguardando a fábrica").first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "3", level: 3 })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "2", level: 3 })
  ).toBeVisible();
  await expect(
    page.getByText("1 atendimento(s) · página 1 de 1")
  ).toBeVisible();
});

test("support: filtrar por situação manda o NOME do enum ao backend", async ({
  page,
}) => {
  // O backend traduz o nome para o valor gravado; mandar o valor em português
  // daqui acoplaria a tela ao banco.
  const spy = await mockGraphql(page, {
    ClientSupportCases: () => queue([supportCase()]),
    ClientSupportCounts: () => counts(),
  });
  await page.goto("/support?status=WAITING_FACTORY");

  const variables = await spy.waitForCall("ClientSupportCases");
  const input = variables.input as {
    filters?: { field: string; value: string }[];
  };
  expect(
    input.filters?.some(
      (f) => f.field === "status" && f.value === "WAITING_FACTORY"
    )
  ).toBe(true);
});

test("support/caso: o andamento leva a mudança de situação junto", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    ClientSupportCase: () => ({
      clientSupportCase: {
        status: true,
        message: "ok",
        data: {
          ...supportCase(),
          description: "Cliente ligou reclamando da última entrega.",
          resolution: null,
          order: null,
          openedBy: { id: "u-1", name: "Calazans" },
          updates: [
            {
              __typename: "ClientSupportUpdateType",
              id: "upd-1",
              caseId: "case-1",
              kind: "STATUS_CHANGE",
              body: "Falei com a fábrica.",
              statusFrom: "OPEN",
              statusTo: "WAITING_FACTORY",
              createdAt: "2026-08-29T12:00:00Z",
              author: { id: "u-1", name: "Calazans" },
            },
          ],
        },
      },
    }),
    AddClientSupportUpdate: () => ({
      addClientSupportUpdate: {
        status: true,
        message: "ok",
        data: {
          id: "upd-2",
          kind: "STATUS_CHANGE",
          body: "Fábrica autorizou a troca.",
          statusFrom: "WAITING_FACTORY",
          statusTo: "RESOLVED",
          createdAt: "2026-09-03T12:00:00Z",
        },
      },
    }),
  });
  await page.goto("/support/case-1");

  // A linha do tempo mostra o de-para gravado, não o texto do andamento.
  await expect(page.getByText("ABERTO → AGUARDANDO A FÁBRICA")).toBeVisible();

  await page.getByLabel(/o que aconteceu/i).fill("Fábrica autorizou a troca.");
  await page.getByRole("button", { name: "Registrar andamento" }).click();

  const variables = await spy.waitForCall("AddClientSupportUpdate");
  const input = variables.input as { caseId: string; body: string };
  expect(input.caseId).toBe("case-1");
  expect(input.body).toBe("Fábrica autorizou a troca.");
});
