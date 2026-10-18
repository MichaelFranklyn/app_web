import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";
import { grantRole } from "../support/role";

/**
 * A central de pendências: um cartão por assunto, e a lista do assunto aberta
 * na própria página.
 *
 * O que estes testes prendem é o que a tela promete a quem a abre: o cartão
 * diz quantas pendências há e mostra as mais urgentes; a lista diz a
 * prioridade, o prazo e o MOTIVO de cada uma e leva direto aonde se resolve; e
 * o recorte (prazo, vendedor, assunto) chega ao backend — a lista é paginada
 * lá, e filtrar a página na tela mentiria sobre o total.
 */
const item = (over: Record<string, unknown> = {}) => ({
  __typename: "PendingItemType",
  id: "VISIT_UNANSWERED:v-1:seller-1",
  entityId: "v-1",
  clientId: "client-1",
  type: "VISIT_OVERDUE",
  reason: "VISIT_UNANSWERED",
  priority: "HIGH",
  dueDate: "2026-10-07",
  daysLate: 4,
  clientName: "Mercadinho do Zé",
  link: "/agenda/2026-10-11?seller=seller-1",
  clientLink: "/clients/cc-1",
  factoryName: null,
  sellerId: "seller-1",
  sellerName: "João Sacramento",
  amount: null,
  referenceDate: "2026-10-07",
  isRemote: false,
  allowanceDays: 0,
  isEstimated: false,
  highAfterDays: 3,
  scheduledDate: null,
  note: null,
  orderId: null,
  orderDate: null,
  contactPhone: null,
  installmentCount: null,
  ...over,
});

const order = (over: Record<string, unknown> = {}) =>
  item({
    id: "PENDING_INVOICE:o-1:seller-1",
    type: "ORDER_STALLED",
    reason: "PENDING_INVOICE",
    priority: "MEDIUM",
    dueDate: "2026-10-09",
    daysLate: 2,
    clientName: "Decore Casa",
    link: "/orders/o-1",
    factoryName: "Herc",
    amount: "1500.00",
    referenceDate: "2026-10-02",
    allowanceDays: 7,
    highAfterDays: 15,
    orderId: "o-1",
    orderDate: "2026-10-02",
    ...over,
  });

const comeBack = (over: Record<string, unknown> = {}) =>
  item({
    id: "RETURN_DATE:v-9:seller-1",
    type: "RETURN_SCHEDULED",
    reason: "RETURN_DATE",
    priority: "LOW",
    dueDate: "2026-10-16",
    daysLate: -5,
    clientName: "Casa Bahia Tintas",
    link: "/clients/cc-3",
    clientLink: "/clients/cc-3",
    referenceDate: "2026-09-30",
    allowanceDays: null,
    highAfterDays: 0,
    ...over,
  });

const TODAY = "2026-10-11";
const TYPES = [
  "VISIT_OVERDUE",
  "FOLLOW_UP",
  "RETURN_SCHEDULED",
  "VISIT_FREQUENCY",
  "ORDER_STALLED",
  "INSTALLMENT_OVERDUE",
  "CLIENT_NO_CONTACT",
  "ADDRESS_ISSUE",
];

type Row = Record<string, unknown>;
type Variables = Record<string, unknown>;

/** A faixa do prazo, como o backend calcula (o mock fixa "hoje"). */
const whenOf = (i: Row) => {
  const due = i.dueDate as string | null;
  if (!due) return "NO_DUE";
  if (due < TODAY) return "OVERDUE";
  if (due === TODAY) return "TODAY";
  return due <= "2026-10-18" ? "NEXT_7_DAYS" : "LATER";
};

const inWhen = (all: Row[], variables: Variables) => {
  const when = variables.when as string | null | undefined;
  return when ? all.filter((i) => whenOf(i) === when) : all;
};

/**
 * O RESUMO como o backend monta: um contador por tipo (com as mais urgentes,
 * na ordem em que a lista as traria) no recorte da faixa de prazo, e os
 * contadores de prazo da tela inteira.
 */
const summary = (all: Row[], variables: Variables = {}) => {
  const scoped = inWhen(all, variables);
  const size = (variables.sampleSize as number | undefined) ?? 0;
  return {
    myPendingItems: {
      __typename: "PendingItemsDataResponse",
      status: true,
      message: "ok",
      data: {
        __typename: "PendingItemsType",
        generatedAt: "2026-10-11T17:32:00Z",
        totalCount: scoped.length,
        counts: TYPES.map((type) => {
          const ofType = scoped.filter((i) => i.type === type);
          return {
            __typename: "PendingTypeCountType",
            type,
            count: ofType.length,
            highCount: ofType.filter((i) => i.priority === "HIGH").length,
            samples: ofType.slice(0, size),
          };
        }),
        whenCounts: ["OVERDUE", "TODAY", "NEXT_7_DAYS", "LATER", "NO_DUE"].map(
          (bucket) => ({
            __typename: "PendingWhenCountType",
            when: bucket,
            count: all.filter((i) => whenOf(i) === bucket).length,
            highCount: all.filter(
              (i) => whenOf(i) === bucket && i.priority === "HIGH"
            ).length,
          })
        ),
      },
    },
  };
};

/** A LISTA de um assunto: o mesmo recorte, cortado pelo tipo. */
const cases = (all: Row[], variables: Variables = {}) => {
  const types = variables.types as string[] | null | undefined;
  const items = inWhen(all, variables).filter(
    (i) => !types || types.includes(i.type as string)
  );
  return {
    myPendingItems: {
      __typename: "PendingItemsDataResponse",
      status: true,
      message: "ok",
      data: {
        __typename: "PendingItemsType",
        totalCount: items.length,
        items,
      },
    },
  };
};

/** As duas consultas da tela, respondendo sobre as mesmas pendências. */
const handlers = (all: Row[]) => ({
  MyPendingItems: (variables: Variables) => summary(all, variables),
  MyPendingCases: (variables: Variables) => cases(all, variables),
});

type Page = import("@playwright/test").Page;

/** O cartão de um assunto, pelo título. */
const cardOf = (page: Page, title: string) =>
  page.locator('[data-tour="pending-card"]').filter({
    has: page.getByRole("heading", { name: title, exact: true }),
  });

/** A lista aberta na página. */
const list = (page: Page) => page.locator('[data-tour="pending-cases"]');

/** Uma linha da lista aberta, pelo cliente. */
const rowOf = (page: Page, client: string) =>
  list(page).getByRole("listitem").filter({ hasText: client });

/** Abre a lista do assunto pelo botão do cartão. */
const openCard = async (page: Page, title: string) => {
  await cardOf(page, title).getByRole("button", { name: /^Ver / }).click();
  await expect(list(page)).toBeVisible();
};

test("pendências: cada assunto é um cartão com o número e os mais urgentes", async ({
  page,
}) => {
  await mockGraphql(
    page,
    handlers([
      item(),
      order(),
      order({
        id: "PENDING_INVOICE:o-2:seller-1",
        entityId: "o-2",
        orderId: "o-2",
        clientName: "Aço Curvado",
        priority: "HIGH",
        daysLate: 20,
      }),
      comeBack(),
    ])
  );

  await page.goto("/pending");

  const visits = cardOf(page, "Visitas sem resposta");
  await expect(visits).toContainText("de prioridade alta");
  // A amostra: de quem é e o prazo, sem abrir nada.
  await expect(visits).toContainText("Mercadinho do Zé");
  await expect(visits).toContainText("venceu há 4 dias");
  await expect(
    visits.getByRole("button", { name: "Ver as visitas (1)" })
  ).toBeVisible();

  const orders = cardOf(page, "Pedidos parados");
  await expect(orders).toContainText("1 de prioridade alta");
  await expect(orders).toContainText("Decore Casa");
  await expect(orders).toContainText("Aço Curvado");
  // Em pedido, a fábrica e o valor identificam qual é.
  await expect(orders).toContainText(/Herc · R\$\s1\.500,00/);
  await expect(
    orders.getByRole("button", { name: "Ver os pedidos (2)" })
  ).toBeVisible();

  // Retorno ainda no prazo: aparece, mas sem alarme.
  const returns = cardOf(page, "Retornos combinados");
  await expect(returns).toContainText("nenhuma de prioridade alta");
  await expect(returns).toContainText("vence em 5 dias");

  // Assunto sem pendência não ganha cartão.
  await expect(cardOf(page, "Boletos vencidos")).toHaveCount(0);
  // Nenhuma lista aberta até alguém pedir.
  await expect(list(page)).toHaveCount(0);

  // O recorte padrão está escrito: sem isso, o retorno de daqui a dois meses
  // pareceria perdido.
  await expect(page.getByText(/vence nos próximos 7 dias/)).toBeVisible();
});

test("pendências: abrir o cartão mostra a lista com prioridade, prazo e motivo", async ({
  page,
}) => {
  const spy = await mockGraphql(page, handlers([item(), order(), comeBack()]));

  await page.goto("/pending");
  await openCard(page, "Pedidos parados");

  // A lista é do backend, cortada pelo assunto — e o assunto fica na URL: quem
  // abre o pedido e volta cai na mesma lista.
  await expect
    .poll(() => spy.lastVariables("MyPendingCases")?.types)
    .toEqual(["ORDER_STALLED"]);
  await expect(page).toHaveURL(/type=ORDER_STALLED/);

  const stalled = rowOf(page, "Decore Casa");
  await expect(stalled).toContainText("Média");
  await expect(stalled).toContainText("a fábrica ainda não faturou");
  // A régua escrita: 7 dias de prazo + 2 de atraso = confirmado há 9 dias.
  await expect(stalled).toContainText("Confirmado em 02/10/2026, há 9 dias");
  await expect(stalled).toContainText("Prazo considerado: 7 dias");
  await expect(stalled).toContainText("Herc");
  await expect(stalled).toContainText("venceu há 2 dias");
  await expect(
    stalled.getByRole("link", { name: "Abrir pedido" })
  ).toHaveAttribute("href", "/orders/o-1");
  // Só o assunto aberto: a visita não entra na lista de pedidos.
  await expect(rowOf(page, "Mercadinho do Zé")).toHaveCount(0);
  await expect(list(page)).toContainText("1 pendência");

  // O mesmo botão fecha — e a URL volta a ser só os cartões.
  await cardOf(page, "Pedidos parados")
    .getByRole("button", { name: "Fechar lista" })
    .click();
  await expect(list(page)).toHaveCount(0);
  await expect(page).not.toHaveURL(/type=/);
});

test("pendências: visita sem resposta diz o que houve e leva à rota", async ({
  page,
}) => {
  await mockGraphql(page, handlers([item()]));

  await page.goto("/pending?type=VISIT_OVERDUE");

  const visit = rowOf(page, "Mercadinho do Zé");
  await expect(visit).toContainText("Alta");
  // O motivo por extenso, com a data do fato.
  await expect(visit).toContainText(
    "A visita de 07/10/2026 ficou sem resposta"
  );
  await expect(visit).toContainText("venceu há 4 dias");
  await expect(
    visit.getByRole("link", { name: "Responder na rota" })
  ).toHaveAttribute("href", "/agenda/2026-10-11?seller=seller-1");
});

test("pendências: contato agendado traz o motivo e abre o agendamento", async ({
  page,
}) => {
  await mockGraphql(
    page,
    handlers([
      item({
        id: "FOLLOW_UP_DUE:fu-1:seller-1",
        type: "FOLLOW_UP",
        reason: "FOLLOW_UP_DUE",
        dueDate: "2026-10-11",
        daysLate: 0,
        clientName: "Armazém Central",
        link: "/follow-ups/fu-1",
        clientLink: "/clients/cc-7",
        referenceDate: "2026-10-01",
        allowanceDays: null,
        highAfterDays: 0,
        note: "Retornar sobre o orçamento",
      }),
    ])
  );

  await page.goto("/pending");
  await expect(cardOf(page, "Contatos agendados")).toContainText("vence hoje");
  await openCard(page, "Contatos agendados");

  const row = rowOf(page, "Armazém Central");
  // O motivo é o que a pessoa escreveu ao agendar — não uma frase genérica.
  await expect(row).toContainText(
    "Retornar sobre o orçamento — agendado em 01/10/2026"
  );
  await expect(row).toContainText("vence hoje");
  await expect(row.getByRole("link", { name: "Abrir contato" })).toBeVisible();
  // O destino não é a ficha do cliente, então o atalho para ela aparece.
  await expect(row.getByRole("link", { name: "Ver cliente" })).toBeVisible();
});

test("pendências: o contato agendado do retorno nasce vinculado a ele", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    ...handlers([comeBack({ entityId: "v-9", clientId: "client-3" })]),
    CreateClientFollowUp: () => ({
      createClientFollowUp: {
        status: true,
        message: "ok",
        data: { id: "fu-9", status: "SCHEDULED", dueDate: "2026-10-16" },
      },
    }),
  });
  await page.goto("/pending");
  await openCard(page, "Retornos combinados");

  await rowOf(page, "Casa Bahia Tintas")
    .getByRole("button", { name: "Agendar contato" })
    .click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText(
    "atende o retorno combinado para 16/10/2026"
  );
  await dialog.locator('input[name="reason"]').fill("Retornar como combinado");
  await dialog.getByRole("button", { name: "Agendar" }).click();

  const input = (await spy.waitForCall("CreateClientFollowUp")).input as {
    clientId: string;
    returnItemId: string;
    dueDate: string;
  };
  expect(input.clientId).toBe("client-3");
  expect(input.returnItemId).toBe("v-9");
  // O dia já vem preenchido: o combinado (ou hoje, se ele já passou).
  expect(input.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});

test("pendências: o mais urgente do cartão leva direto aonde se resolve", async ({
  page,
}) => {
  await mockGraphql(page, handlers([order()]));

  await page.goto("/pending");
  await cardOf(page, "Pedidos parados")
    .getByRole("link", { name: /Decore Casa/ })
    .click();

  await expect(page).toHaveURL(/\/orders\/o-1$/);
});

test("pendências: pedido parado também abre a ficha do cliente", async ({
  page,
}) => {
  await mockGraphql(page, handlers([order(), comeBack()]));

  await page.goto("/pending?type=RETURN_SCHEDULED");
  // Quando a ação JÁ leva ao cliente, um segundo botão para o mesmo lugar
  // seria ruído: o retorno não tem "Ver cliente".
  await expect(rowOf(page, "Casa Bahia Tintas")).toBeVisible();
  await expect(
    list(page).getByRole("link", { name: "Ver cliente" })
  ).toHaveCount(0);

  await openCard(page, "Pedidos parados");
  const verCliente = rowOf(page, "Decore Casa").getByRole("link", {
    name: "Ver cliente",
  });
  await verCliente.click();

  await expect(page).toHaveURL(/\/clients\/cc-1/);
});

test("pendências: vendedor não filtra por vendedor nem vê de quem é", async ({
  page,
}) => {
  await mockGraphql(page, handlers([item()]));

  await page.goto("/pending?type=VISIT_OVERDUE");
  const row = rowOf(page, "Mercadinho do Zé");
  await expect(row).toBeVisible();
  // Tudo ali é dele: o nome do responsável seria ruído.
  await expect(row).not.toContainText("João Sacramento");

  await page.getByRole("button", { name: "Filtros" }).click();
  const panel = page.locator("[data-filters-panel]");
  await expect(panel.getByText("Prazo (período)")).toBeVisible();
  await expect(panel.getByPlaceholder("Toda a empresa")).toHaveCount(0);
});

test("pendências: gestor filtra por vendedor e vê de quem é cada uma", async ({
  page,
}) => {
  await grantRole(page, "OWNER");

  const spy = await mockGraphql(page, {
    ...handlers([item()]),
    PendingSellers: () => ({
      pending_sellers: {
        edges: [
          { node: { id: "seller-1", name: "João Sacramento", isActive: true } },
          { node: { id: "seller-2", name: "Mariana Souza", isActive: true } },
        ],
        totalCount: 2,
      },
    }),
  });

  await page.goto("/pending?type=VISIT_OVERDUE");

  await expect(rowOf(page, "Mercadinho do Zé")).toContainText(
    "João Sacramento"
  );

  await page.getByRole("button", { name: "Filtros" }).click();
  const vendedor = page
    .locator("[data-filters-panel]")
    .getByPlaceholder("Toda a empresa");
  await vendedor.click();
  await page
    .locator("[data-select-dropdown]")
    .getByText("Mariana Souza", { exact: true })
    .click();

  // O vendedor recorta os cartões E a lista aberta: os dois perguntam de novo.
  await expect
    .poll(() => spy.lastVariables("MyPendingItems")?.sellerId)
    .toBe("seller-2");
  await expect
    .poll(() => spy.lastVariables("MyPendingCases")?.sellerId)
    .toBe("seller-2");
});

test("pendências: nada pendente é boa notícia, não erro", async ({ page }) => {
  await mockGraphql(page, handlers([]));

  await page.goto("/pending");

  await expect(page.getByText("Nada pendente")).toBeVisible();
  await expect(page.locator('[data-tour="pending-card"]')).toHaveCount(0);
  // Os contadores continuam lá, zerados: sumir pareceria defeito.
  const counters = page.locator('[data-tour="pending-counts"]');
  await expect(counters.getByText("Atrasadas")).toBeVisible();
  await expect(counters.getByText("Hoje")).toBeVisible();
  await expect(counters.getByText("Próximos 7 dias")).toBeVisible();
  // "Sem prazo" só aparece quando há cadastro a corrigir.
  await expect(counters.getByText("Sem prazo")).toHaveCount(0);
});

test("pendências: o contador filtra os cartões pelo prazo e fica na URL", async ({
  page,
}) => {
  const spy = await mockGraphql(page, handlers([item(), order(), comeBack()]));

  await page.goto("/pending");
  const counters = page.locator('[data-tour="pending-counts"]');
  // Visita e pedido venceram; o retorno é da semana que vem.
  await expect(
    counters.getByRole("button", { name: /2\s*Atrasadas/ })
  ).toBeVisible();
  await expect(cardOf(page, "Visitas sem resposta")).toBeVisible();

  await counters.getByRole("button", { name: /Próximos 7 dias/ }).click();

  await expect
    .poll(() => spy.lastVariables("MyPendingItems")?.when)
    .toBe("NEXT_7_DAYS");
  await expect(page).toHaveURL(/when=NEXT_7_DAYS/);
  // Só o assunto que tem algo nessa faixa continua com cartão.
  await expect(cardOf(page, "Visitas sem resposta")).toHaveCount(0);
  await expect(cardOf(page, "Retornos combinados")).toBeVisible();
  await expect(
    counters.getByRole("button", { name: /Próximos 7 dias/ })
  ).toHaveAttribute("aria-pressed", "true");
  // Os contadores dizem o que existe para clicar: não mudam com a faixa.
  await expect(
    counters.getByRole("button", { name: /2\s*Atrasadas/ })
  ).toBeVisible();

  // O mesmo clique desfaz.
  await counters.getByRole("button", { name: /Próximos 7 dias/ }).click();
  await expect.poll(() => spy.lastVariables("MyPendingItems")?.when).toBeNull();
  await expect(cardOf(page, "Visitas sem resposta")).toBeVisible();
});

const boleto = (over: Record<string, unknown> = {}) =>
  item({
    id: "INSTALLMENT_UNPAID:o-7:seller-1",
    entityId: "o-7",
    type: "INSTALLMENT_OVERDUE",
    reason: "INSTALLMENT_UNPAID",
    priority: "HIGH",
    // Mais de um ano vencido: continua ALTA — a idade não rebaixa a dívida.
    dueDate: "2025-08-27",
    daysLate: 410,
    clientName: "Armazém Bahia",
    link: "/orders/o-7",
    factoryName: "Lukma",
    amount: "806.00",
    referenceDate: "2025-08-27",
    allowanceDays: 0,
    highAfterDays: 7,
    orderId: "o-7",
    installmentCount: 2,
    ...over,
  });

const address = () =>
  item({
    id: "LOCATION_MISSING:c-8:",
    entityId: "c-8",
    type: "ADDRESS_ISSUE",
    reason: "LOCATION_MISSING",
    priority: "MEDIUM",
    dueDate: null,
    daysLate: null,
    clientName: "Comercial Souza",
    link: "/clients/cc-8",
    clientLink: "/clients/cc-8",
    referenceDate: null,
    allowanceDays: null,
    highAfterDays: null,
  });

test("pendências: boleto vencido tem cartão próprio, sem perder a prioridade", async ({
  page,
}) => {
  const spy = await mockGraphql(page, handlers([item(), boleto(), address()]));

  await page.goto("/pending");

  // O boleto não se mistura com a visita: cada assunto no seu cartão, e a
  // cobrança sempre à vista, com o número.
  await expect(cardOf(page, "Visitas sem resposta")).toContainText(
    "Mercadinho do Zé"
  );
  const charges = cardOf(page, "Boletos vencidos");
  // Mais de um ano vencido e continua ALTA — a idade não rebaixa a dívida.
  await expect(charges).toContainText("de prioridade alta");
  await expect(charges).toContainText("Armazém Bahia");
  await expect(charges).toContainText("venceu há 410 dias");
  await expect(charges).not.toContainText("Mercadinho do Zé");

  await openCard(page, "Boletos vencidos");

  await expect
    .poll(() => spy.lastVariables("MyPendingCases")?.types)
    .toEqual(["INSTALLMENT_OVERDUE"]);
  await expect(page).toHaveURL(/type=INSTALLMENT_OVERDUE/);

  const row = rowOf(page, "Armazém Bahia");
  await expect(row).toContainText("Alta");
  // Quantidade, valor em aberto e vencimento mais antigo — e o detalhe a um
  // clique.
  await expect(row).toContainText("2 parcelas vencidas");
  await expect(row).toContainText(/806,00 em aberto/);
  await expect(row).toContainText("A mais antiga venceu em 27/08/2025");
  await expect(row.getByRole("link", { name: "Abrir pedido" })).toHaveAttribute(
    "href",
    "/orders/o-7"
  );
  await expect(rowOf(page, "Mercadinho do Zé")).toHaveCount(0);
});

for (const url of [
  "/pending?type=INSTALLMENT_OVERDUE",
  // O link da tela antiga, que separava "Cobranças" numa seção.
  "/pending?section=charges",
]) {
  test(`pendências: o link ${url} abre a lista dos boletos`, async ({
    page,
  }) => {
    await mockGraphql(page, handlers([item(), boleto()]));

    await page.goto(url);

    await expect(rowOf(page, "Armazém Bahia")).toBeVisible();
    await expect(
      cardOf(page, "Boletos vencidos").getByRole("button", {
        name: "Fechar lista",
      })
    ).toHaveAttribute("aria-expanded", "true");
  });
}

test("pendências: endereço a corrigir não tem prazo e leva ao cadastro", async ({
  page,
}) => {
  await mockGraphql(page, handlers([address()]));

  await page.goto("/pending");

  const card = cardOf(page, "Endereços a corrigir");
  await expect(card).toContainText("sem prazo — trava a rotina");
  await expect(card).toContainText("Comercial Souza");
  await openCard(page, "Endereços a corrigir");

  const row = rowOf(page, "Comercial Souza");
  await expect(row).toContainText("sem prazo");
  await expect(
    row.getByRole("link", { name: "Corrigir cadastro" })
  ).toHaveAttribute("href", "/clients/cc-8");

  // Há cadastro a corrigir: o contador "Sem prazo" aparece.
  await expect(
    page.locator('[data-tour="pending-counts"]').getByText("Sem prazo")
  ).toBeVisible();
});

test("pendências: frequência vencida não se confunde com visita sem resposta", async ({
  page,
}) => {
  await mockGraphql(
    page,
    handlers([
      item(),
      item({
        id: "FREQUENCY_DUE:c-5:seller-1",
        entityId: "c-5",
        type: "VISIT_FREQUENCY",
        reason: "FREQUENCY_DUE",
        priority: "MEDIUM",
        dueDate: "2026-10-01",
        daysLate: 10,
        clientName: "Loja Central",
        link: "/clients/cc-5",
        clientLink: "/clients/cc-5",
        referenceDate: "2026-08-17",
        allowanceDays: 45,
        highAfterDays: null,
      }),
    ])
  );

  await page.goto("/pending");

  // Dois assuntos, dois cartões: cada cliente no seu.
  await expect(cardOf(page, "Visitas sem resposta")).toContainText(
    "Mercadinho do Zé"
  );
  const frequency = cardOf(page, "Frequência de visita vencida");
  await expect(frequency).toContainText("Loja Central");
  await expect(frequency).not.toContainText("Mercadinho do Zé");

  await openCard(page, "Frequência de visita vencida");
  const row = rowOf(page, "Loja Central");
  await expect(row).toContainText("Última visita em 17/08/2026, há 55 dias");
  await expect(row).toContainText("a cada 45 dias");
});

test("pendências: entrega sem confirmar traz o WhatsApp do pós-venda", async ({
  page,
}) => {
  await mockGraphql(
    page,
    handlers([
      order({
        id: "DELIVERY_UNCONFIRMED:o-1:seller-1",
        reason: "DELIVERY_UNCONFIRMED",
        referenceDate: "2026-08-20",
        orderDate: "2026-07-30",
        allowanceDays: 10,
        daysLate: 42,
        contactPhone: "(71) 99999-8888",
      }),
      order({
        id: "DELIVERY_UNCONFIRMED:o-2:seller-1",
        entityId: "o-2",
        orderId: "o-2",
        clientName: "Aço Curvado",
        link: "/orders/o-2",
        clientLink: "/clients/cc-2",
        reason: "DELIVERY_UNCONFIRMED",
        orderDate: "2026-07-23",
        contactPhone: null,
      }),
    ])
  );

  await page.goto("/pending?type=ORDER_STALLED");

  const whatsapp = list(page).getByRole("link", {
    name: /Perguntar pelo WhatsApp se o pedido de Decore/,
  });
  const href = await whatsapp.getAttribute("href");
  expect(href).toContain("https://wa.me/5571999998888?text=");
  expect(decodeURIComponent(href!.split("text=")[1])).toContain(
    "o pedido da Herc feito em 30/07/2026 já foi entregue"
  );

  // Sem celular não há WhatsApp: o caminho é cadastrar o contato.
  await expect(
    list(page).getByRole("link", { name: "Cadastrar contato" })
  ).toHaveAttribute("href", "/clients/cc-2");
});

test("pendências: no celular o cartão e a lista cabem sem rolar para o lado", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockGraphql(page, handlers([order()]));

  await page.goto("/pending?type=ORDER_STALLED");

  // Não há tabela em largura nenhuma: cartão e lista se empilham.
  await expect(page.getByRole("table")).toHaveCount(0);
  await expect(cardOf(page, "Pedidos parados")).toContainText(
    "venceu há 2 dias"
  );
  const row = rowOf(page, "Decore Casa");
  await expect(row.getByText("venceu há 2 dias")).toBeVisible();
  await expect(row.getByRole("link", { name: "Abrir pedido" })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
