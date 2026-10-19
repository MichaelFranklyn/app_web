import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Oportunidades (a antiga /insights): onde vale concentrar a próxima ação
 * comercial.
 *
 * O que estes testes prendem é a diferença para Pendências: aqui são cartões de
 * análise, com o motivo e a lista de clientes aberta NA PRÓPRIA página; daqui
 * se agenda o contato ou a visita, e o cliente passa a dizer o que já está
 * marcado. Nada de pedido parado, boleto ou meta — isso mora em outro lugar.
 */
const sample = (over: Record<string, unknown> = {}) => ({
  id: "c-1",
  label: "DECORE CASA & CONSTRUCAO",
  detail: "348 dias sem comprar",
  link: "/clients/cc-1",
  reason: null,
  clientId: "c-1",
  nextFollowUpDate: null,
  nextVisitDate: null,
  ...over,
});

const opportunity = (over: Record<string, unknown> = {}) => ({
  kind: "CLIENT_OVERDUE",
  count: 23,
  blockedCount: 0,
  samples: [sample()],
  ...over,
});

const overview = (insights: Array<Record<string, unknown>>) => ({
  myInsights: {
    status: true,
    message: "ok",
    data: { generatedAt: "2026-10-11T10:00:00Z", insights },
  },
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

test("oportunidades: o cartão traz o número, o motivo e quem são", async ({
  page,
}) => {
  await mockGraphql(page, { MyOpportunities: () => overview([opportunity()]) });

  await page.goto("/opportunities");

  await expect(
    page.getByRole("heading", { name: "Oportunidades", level: 1 })
  ).toBeVisible();
  await expect(
    page.getByText("Onde vale concentrar suas próximas ações comerciais.", {
      exact: false,
    })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Clientes no momento de recomprar" })
  ).toBeVisible();
  await expect(
    page.getByText("clientes já passaram do próprio intervalo de compra")
  ).toBeVisible();
  await expect(page.getByText(/reponha a prateleira/i)).toBeVisible();
  await expect(page.getByText("DECORE CASA & CONSTRUCAO")).toBeVisible();
  // Oportunidade é escolha, não cobrança: a tela não fala em "atrasado".
  await expect(page.getByText(/atrasad/i)).toHaveCount(0);
});

test("oportunidades: a lista abre na própria página, paginada no servidor", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    MyOpportunities: () => overview([opportunity()]),
    MyOpportunityCases: (variables) =>
      casesPage(
        "CLIENT_OVERDUE",
        23,
        Number(variables.offset) === 0
          ? [sample(), sample({ id: "c-2", label: "ESKINA DA CONSTRUCAO" })]
          : [sample({ id: "c-21", label: "VITORIA TEND-TUDO SALVADOR" })]
      ),
  });

  await page.goto("/opportunities");
  await page.getByRole("button", { name: "Ver clientes (23)" }).click();

  // Na página, não num modal: daqui se abre o modal de agendar.
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("ESKINA DA CONSTRUCAO")).toBeVisible();
  expect(await spy.waitForCall("MyOpportunityCases")).toMatchObject({
    kind: "CLIENT_OVERDUE",
    offset: 0,
  });
  // O cartão aberto mora na URL: o aviso do sino chega com a lista aberta.
  await expect(page).toHaveURL(/open=CLIENT_OVERDUE/);

  await page.getByRole("button", { name: "2", exact: true }).click();
  await expect(page.getByText("VITORIA TEND-TUDO SALVADOR")).toBeVisible();
  expect(spy.lastVariables("MyOpportunityCases")).toMatchObject({
    offset: 20,
  });
});

test("oportunidades: o cliente avisa o contato já agendado", async ({
  page,
}) => {
  await mockGraphql(page, {
    MyOpportunities: () => overview([opportunity()]),
    MyOpportunityCases: () =>
      casesPage("CLIENT_OVERDUE", 1, [
        sample({ nextFollowUpDate: "2026-10-14" }),
      ]),
  });

  await page.goto("/opportunities?open=CLIENT_OVERDUE");

  await expect(
    page.getByText("Contato agendado para 14/10/2026")
  ).toBeVisible();
});

test("oportunidades: agendar o contato sai com o cliente já escolhido", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    MyOpportunities: () => overview([opportunity()]),
    MyOpportunityCases: () => casesPage("CLIENT_OVERDUE", 1, [sample()]),
    CreateClientFollowUp: () => ({
      createClientFollowUp: {
        status: true,
        message: "ok",
        data: { id: "fu-1", status: "SCHEDULED", dueDate: "2026-10-14" },
      },
    }),
  });

  await page.goto("/opportunities?open=CLIENT_OVERDUE");
  await page.getByRole("button", { name: "Agendar contato" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("DECORE CASA & CONSTRUCAO");
  // O dia já vem sugerido (hoje) — e À VISTA no campo, para a pessoa conferir
  // antes de salvar. O motivo é opcional: dá para agendar direto.
  const today = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
  await expect(
    dialog.getByRole("textbox", { name: /Dia do contato/ })
  ).toHaveValue(today);
  await dialog.getByRole("button", { name: "Agendar" }).click();

  const input = (await spy.waitForCall("CreateClientFollowUp")).input as {
    clientId: string;
    dueDate: string;
  };
  expect(input.clientId).toBe("c-1");
  expect(input.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  // Depois de agendar, a lista relê — é assim que o "contato agendado para X"
  // aparece sem recarregar a tela.
  await expect
    .poll(() => spy.calls("MyOpportunityCases").length)
    .toBeGreaterThan(1);
});

test("oportunidades: prioritário travado explica o motivo em vez de acusar a rotina", async ({
  page,
}) => {
  await mockGraphql(page, {
    MyOpportunities: () =>
      overview([
        opportunity({
          kind: "PRIORITY_OFF_ROUTE",
          count: 0,
          blockedCount: 5,
          samples: [
            sample({
              id: "c-9",
              label: "CENTRO MATERIAL",
              detail: "score 63 · HERC, pedido de 28/11/2025",
              link: "/orders/o-9",
              reason: "ORDER_OPEN",
              clientId: "c-9",
            }),
          ],
        }),
      ]),
    MyOpportunityCases: () =>
      casesPage("PRIORITY_OFF_ROUTE", 5, [
        sample({
          id: "c-9",
          label: "CENTRO MATERIAL",
          detail: "score 63 · HERC, pedido de 28/11/2025",
          link: "/orders/o-9",
          reason: "ORDER_OPEN",
          clientId: "c-9",
        }),
      ]),
  });

  await page.goto("/opportunities");

  await expect(page.getByText("clientes explicados")).toBeVisible();
  await expect(page.getByText(/de propósito/i)).toBeVisible();

  await page.getByRole("button", { name: /Ver quem ficou de fora/ }).click();
  await expect(
    page.getByText("Pedido em aberto", { exact: true })
  ).toBeVisible();
});

test("oportunidades: sem oportunidade, a tela aponta para Pendências", async ({
  page,
}) => {
  await mockGraphql(page, { MyOpportunities: () => overview([]) });

  await page.goto("/opportunities");

  await expect(page.getByText("Nenhuma oportunidade agora")).toBeVisible();
});

test("oportunidades: o link antigo /insights redireciona com a query", async ({
  page,
}) => {
  await mockGraphql(page, {
    MyOpportunities: () => overview([opportunity()]),
    MyOpportunityCases: () => casesPage("CLIENT_OVERDUE", 1, [sample()]),
  });

  await page.goto("/insights?open=CLIENT_OVERDUE");

  await expect(page).toHaveURL(/\/opportunities\?open=CLIENT_OVERDUE$/);
  await expect(
    page.getByRole("button", { name: "Agendar contato" })
  ).toBeVisible();
});
