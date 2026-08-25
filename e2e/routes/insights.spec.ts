import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * A tela de insights: o que está pendente HOJE e por quê.
 *
 * O que estes testes prendem é o que diferencia esta tela de uma lista de
 * avisos: cada cartão traz o MOTIVO por extenso e o caminho para resolver, e a
 * tela vazia é uma boa notícia, não um erro.
 */
const insight = (over: Record<string, unknown> = {}) => ({
  kind: "CLIENT_OVERDUE",
  group: "WALLET",
  count: 23,
  blockedCount: 0,
  amount: null,
  daysLeft: null,
  samples: [
    {
      id: "c-1",
      label: "DECORE CASA & CONSTRUCAO",
      detail: "348 dias sem comprar",
      link: null,
      reason: null,
    },
  ],
  ...over,
});

const caseItem = (over: Record<string, unknown> = {}) => ({
  id: "c-1",
  label: "DECORE CASA & CONSTRUCAO",
  detail: "348 dias sem comprar",
  link: null,
  reason: null,
  ...over,
});

const casesPage = (
  kind: string,
  totalCount: number,
  cases: Array<Record<string, unknown>>
) => ({
  myInsightCases: {
    status: true,
    message: "ok",
    data: { kind, totalCount, cases },
  },
});

const overview = (insights: Array<Record<string, unknown>>) => ({
  myInsights: {
    status: true,
    message: "ok",
    data: { generatedAt: "2026-08-24T10:00:00Z", insights },
  },
});

test("insights: cada pendência traz o número, o motivo e a saída", async ({
  page,
}) => {
  await mockGraphql(page, { MyInsights: () => overview([insight()]) });

  await page.goto("/insights");

  await expect(
    page.getByText("23 clientes passaram do próprio ritmo de compra")
  ).toBeVisible();
  // O porquê é o que transforma o número em decisão — sem ele a tela é um log.
  await expect(
    page.getByText(/repõe a prateleira com outro representante/i)
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Ver na carteira" })
  ).toBeVisible();
  // O exemplo dá nome a quem está atrasado.
  await expect(page.getByText("DECORE CASA & CONSTRUCAO")).toBeVisible();
});

test("insights: o mais caro primeiro, não o mais numeroso", async ({
  page,
}) => {
  await mockGraphql(page, {
    MyInsights: () =>
      overview([
        insight({ kind: "NO_VISIT_30D", count: 136, samples: [] }),
        insight({
          kind: "INSTALLMENT_OVERDUE",
          group: "MONEY",
          count: 3,
          amount: "4500.00",
          samples: [],
        }),
      ]),
  });

  await page.goto("/insights");

  // A leitura chega por query do cliente: espera o primeiro cartão pintar antes
  // de fotografar a ordem, senão a lista sai vazia e a asserção mente.
  await expect(
    page.getByRole("heading", { name: "Resolver hoje", level: 4 })
  ).toBeVisible();

  // Títulos de seção e de cartão são o mesmo `heading-sm` do Title (<h4>), então
  // a lista abaixo é a tela inteira na ordem em que ela é lida.
  const titles = await page
    .getByRole("heading", { level: 4 })
    .allTextContents();

  // Boleto vencido custa dinheiro hoje; 136 clientes sem visita há um mês é
  // sinal de fundo. Ordenar por contagem enterraria o que precisa de ação.
  const urgente = titles.findIndex((t) => t.includes("Resolver hoje"));
  const boleto = titles.findIndex((t) => t.includes("boletos vencidos"));
  const fundo = titles.findIndex((t) => t.includes("De olho"));

  expect(urgente).toBe(0);
  expect(boleto).toBe(1);
  expect(fundo).toBeGreaterThan(boleto);
});

test("insights: sem pendência, a tela diz que está tudo em dia", async ({
  page,
}) => {
  await mockGraphql(page, { MyInsights: () => overview([]) });

  await page.goto("/insights");

  await expect(page.getByText("Nada pendente")).toBeVisible();
});

test('insights: o "e mais N" abre a lista completa, paginada no servidor', async ({
  page,
}) => {
  // O cartão mostra 1 de 23. O "e mais 22" era um beco — dizia que havia mais e
  // não deixava ver quem.
  const spy = await mockGraphql(page, {
    MyInsights: () => overview([insight()]),
    MyInsightCases: (variables) =>
      casesPage(
        "CLIENT_OVERDUE",
        23,
        Number(variables.offset) === 0
          ? [caseItem(), caseItem({ id: "c-2", label: "ESKINA DA CONSTRUCAO" })]
          : [caseItem({ id: "c-21", label: "VITORIA TEND-TUDO SALVADOR" })]
      ),
  });

  await page.goto("/insights");
  await page.getByRole("button", { name: "e mais 22" }).click();

  // A lista chega do servidor, não de um recorte que o front inventou.
  await expect(page.getByText("ESKINA DA CONSTRUCAO")).toBeVisible();
  const primeira = await spy.waitForCall("MyInsightCases");
  expect(primeira).toMatchObject({ kind: "CLIENT_OVERDUE", offset: 0 });

  // Página 2: o offset anda, e é o servidor que devolve o próximo pedaço.
  await page.getByRole("button", { name: "2", exact: true }).click();
  await expect(page.getByText("VITORIA TEND-TUDO SALVADOR")).toBeVisible();
  expect(spy.lastVariables("MyInsightCases")).toMatchObject({ offset: 20 });
});

test("insights: prioritário travado explica o motivo em vez de acusar a rotina", async ({
  page,
}) => {
  // O caso que veio da produção: nove "prioritários ignorados" que o próprio
  // motor tinha descartado de propósito.
  await mockGraphql(page, {
    MyInsights: () =>
      overview([
        insight({
          kind: "PRIORITY_OFF_ROUTE",
          count: 0,
          blockedCount: 5,
          samples: [
            {
              id: "c-9",
              label: "CENTRO MATERIAL",
              detail: "score 63 · HERC, pedido de 28/11/2025",
              link: null,
              reason: "ORDER_OPEN",
            },
          ],
        }),
      ]),
    MyInsightCases: () =>
      casesPage("PRIORITY_OFF_ROUTE", 5, [
        caseItem({
          id: "c-9",
          label: "CENTRO MATERIAL",
          detail: "score 63 · HERC, pedido de 28/11/2025",
          reason: "ORDER_OPEN",
        }),
      ]),
  });

  await page.goto("/insights");

  // Sem nada a decidir, o cartão fala de pendência — não manda rever a rotina.
  await expect(
    page.getByText("5 clientes prioritários estão travados por uma pendência")
  ).toBeVisible();
  await expect(page.getByText(/de propósito/i)).toBeVisible();
  // E cai para "De olho": travado não compete com o que custa dinheiro hoje.
  await expect(
    page.getByRole("heading", { name: "De olho", level: 4 })
  ).toBeVisible();

  // O motivo, por caso, na lista completa.
  await page.getByRole("button", { name: "Ver todos" }).click();
  await expect(
    page.getByText("Pedido em aberto", { exact: true })
  ).toBeVisible();
});

test("insights: dois casos do mesmo registro aparecem os dois", async ({
  page,
}) => {
  // Duas metas atrasadas da MESMA fábrica, de vendedores diferentes: mesmo
  // `id` (o da fábrica), casos distintos. A chave do React saía duplicada e o
  // React avisava que pode duplicar ou OMITIR — o risco real é o gestor ver uma
  // linha onde há duas cobranças.
  const fabrica = "57573182-0642-492c-b651-e5e6908a93ee";
  await mockGraphql(page, {
    MyInsights: () =>
      overview([
        insight({
          kind: "GOAL_BEHIND",
          group: "GOALS",
          count: 2,
          amount: "37964.09",
          daysLeft: 6,
          samples: [
            {
              id: fabrica,
              label: "HERC · Celso",
              detail: "faltam R$ 23.118,10",
              link: "/goals",
              reason: null,
            },
            {
              id: fabrica,
              label: "HERC · Lacerda",
              detail: "faltam R$ 11.845,99",
              link: "/goals",
              reason: null,
            },
          ],
        }),
      ]),
  });

  await page.goto("/insights");

  await expect(page.getByText("HERC · Celso")).toBeVisible();
  await expect(page.getByText("HERC · Lacerda")).toBeVisible();
});
