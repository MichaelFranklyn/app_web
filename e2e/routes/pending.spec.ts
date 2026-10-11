import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";
import { grantRole } from "../support/role";

/**
 * A central de pendências: a lista de trabalho do dia.
 *
 * O que estes testes prendem é o que a tela promete a quem a abre: cada linha
 * diz a prioridade, o prazo e o MOTIVO, leva direto aonde se resolve, e o
 * filtro chega ao backend (a lista é paginada lá — filtrar a página na tela
 * mentiria sobre o total).
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
  link: "/routines/2026-10-11?seller=seller-1",
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

/** A faixa do prazo, como o backend calcula (o mock fixa "hoje"). */
const whenOf = (i: Record<string, unknown>) => {
  const due = i.dueDate as string | null;
  if (!due) return "NO_DUE";
  if (due < TODAY) return "OVERDUE";
  if (due === TODAY) return "TODAY";
  return due <= "2026-10-18" ? "NEXT_7_DAYS" : "LATER";
};

/**
 * A resposta como o backend monta: `items` com tipo E faixa, `counts` por tipo
 * só com a faixa, `whenCounts` por faixa só com o tipo. Sem `variables`, devolve
 * tudo (os specs que não filtram nada).
 */
const response = (
  all: Array<Record<string, unknown>>,
  variables: Record<string, unknown> = {}
) => {
  const types = variables.types as string[] | null | undefined;
  const when = variables.when as string | null | undefined;
  const byWhen = when ? all.filter((i) => whenOf(i) === when) : all;
  const byType = types
    ? all.filter((i) => types.includes(i.type as string))
    : all;
  const items = byWhen.filter((i) => byType.includes(i));
  const count = (type: string) => ({
    __typename: "PendingTypeCountType",
    type,
    count: byWhen.filter((i) => i.type === type).length,
    highCount: byWhen.filter((i) => i.type === type && i.priority === "HIGH")
      .length,
  });
  const whenCount = (bucket: string) => ({
    __typename: "PendingWhenCountType",
    when: bucket,
    count: byType.filter((i) => whenOf(i) === bucket).length,
    highCount: byType.filter(
      (i) => whenOf(i) === bucket && i.priority === "HIGH"
    ).length,
  });
  return {
    myPendingItems: {
      __typename: "PendingItemsDataResponse",
      status: true,
      message: "ok",
      data: {
        __typename: "PendingItemsType",
        generatedAt: "2026-10-11T17:32:00Z",
        totalCount: items.length,
        counts: [
          "VISIT_OVERDUE",
          "FOLLOW_UP",
          "RETURN_SCHEDULED",
          "VISIT_FREQUENCY",
          "ORDER_STALLED",
          "INSTALLMENT_OVERDUE",
          "CLIENT_NO_CONTACT",
          "ADDRESS_ISSUE",
        ].map(count),
        whenCounts: ["OVERDUE", "TODAY", "NEXT_7_DAYS", "LATER", "NO_DUE"].map(
          whenCount
        ),
        items,
      },
    },
  };
};

test("pendências: cada linha traz prioridade, prazo e motivo", async ({
  page,
}) => {
  await mockGraphql(page, {
    MyPendingItems: () => response([item(), order(), comeBack()]),
  });

  await page.goto("/pending");

  const visit = page.getByRole("row").filter({ hasText: "Mercadinho do Zé" });
  await expect(visit).toContainText("Alta");
  // "Sem resposta", e não "atrasada": a frequência vencida é outra coisa.
  await expect(visit).toContainText("Visita sem resposta");
  // O motivo por extenso, com a data do fato.
  await expect(visit).toContainText(
    "A visita de 07/10/2026 ficou sem resposta"
  );
  await expect(visit).toContainText("venceu há 4 dias");
  await expect(visit).toContainText("Responder na rota");

  const stalled = page.getByRole("row").filter({ hasText: "Decore Casa" });
  await expect(stalled).toContainText("Média");
  await expect(stalled).toContainText("a fábrica ainda não faturou");
  // A régua escrita: 7 dias de prazo + 2 de atraso = confirmado há 9 dias.
  await expect(stalled).toContainText("Confirmado em 02/10/2026, há 9 dias");
  await expect(stalled).toContainText("Prazo considerado: 7 dias");
  await expect(stalled).toContainText("Herc");

  // Retorno ainda no prazo: aparece, mas sem alarme.
  const later = page.getByRole("row").filter({ hasText: "Casa Bahia Tintas" });
  await expect(later).toContainText("Baixa");
  await expect(later).toContainText("vence em 5 dias");

  // O recorte padrão está escrito: sem isso, o retorno de daqui a dois meses
  // pareceria perdido.
  await expect(page.getByText(/vence nos próximos 7 dias/)).toBeVisible();
});

test("pendências: contato agendado traz o motivo e abre o agendamento", async ({
  page,
}) => {
  await mockGraphql(page, {
    MyPendingItems: () =>
      response([
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
      ]),
  });

  await page.goto("/pending");

  const row = page.getByRole("row").filter({ hasText: "Armazém Central" });
  await expect(row).toContainText("Contato agendado");
  // O motivo é o que a pessoa escreveu ao agendar — não uma frase genérica.
  await expect(row).toContainText(
    "Retornar sobre o orçamento — agendado em 01/10/2026"
  );
  await expect(row).toContainText("vence hoje");
  await expect(row).toContainText("Abrir contato");
  // O destino não é a ficha do cliente, então o atalho para ela aparece.
  await expect(row.getByRole("link", { name: "Ver cliente" })).toBeVisible();
});

test("pendências: o contato agendado do retorno nasce vinculado a ele", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    MyPendingItems: () =>
      response([comeBack({ entityId: "v-9", clientId: "client-3" })]),
    CreateClientFollowUp: () => ({
      createClientFollowUp: {
        status: true,
        message: "ok",
        data: { id: "fu-9", status: "SCHEDULED", dueDate: "2026-10-16" },
      },
    }),
  });
  await page.goto("/pending");

  const row = page.getByRole("row").filter({ hasText: "Casa Bahia Tintas" });
  await row.getByRole("button", { name: "Agendar contato" }).click();

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

test("pendências: a linha leva direto aonde se resolve", async ({ page }) => {
  await mockGraphql(page, {
    MyPendingItems: () => response([order()]),
  });

  await page.goto("/pending");
  await page.getByRole("row").filter({ hasText: "Decore Casa" }).click();

  await expect(page).toHaveURL(/\/orders\/o-1$/);
});

test("pendências: pedido parado também abre a ficha do cliente", async ({
  page,
}) => {
  await mockGraphql(page, {
    MyPendingItems: () => response([order(), comeBack()]),
  });

  await page.goto("/pending");

  // Quando a linha JÁ leva ao cliente, um segundo botão para o mesmo lugar
  // seria ruído: só a linha do pedido tem "Ver cliente".
  const verCliente = page
    .getByRole("row")
    .getByRole("link", { name: "Ver cliente" });
  await expect(verCliente).toHaveCount(1);
  await verCliente.click();

  await expect(page).toHaveURL(/\/clients\/cc-1/);
});

test("pendências: filtrar por tipo vai ao backend e fica na URL", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    MyPendingItems: (variables) =>
      response([item(), order(), comeBack()], variables),
  });

  await page.goto("/pending");
  await expect(
    page.getByRole("row").filter({ hasText: "Mercadinho do Zé" })
  ).toBeVisible();

  await page.getByRole("button", { name: "Filtros" }).click();
  const tipo = page
    .locator("[data-filters-panel]")
    .getByPlaceholder("Todos os tipos");
  await tipo.click();
  await page
    .locator("[data-select-dropdown]")
    .getByText("Pedidos parados (1)", { exact: true })
    .click();

  await expect
    .poll(() => spy.lastVariables("MyPendingItems")?.types)
    .toEqual(["ORDER_STALLED"]);
  await expect(page.getByText("Mercadinho do Zé")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Filtros (1)" })).toBeVisible();
  // Na URL: quem abre o pedido e volta cai no mesmo filtro.
  await expect(page).toHaveURL(/type=ORDER_STALLED/);
});

test("pendências: vendedor não filtra por vendedor nem vê a coluna", async ({
  page,
}) => {
  await mockGraphql(page, {
    MyPendingItems: () => response([item()]),
  });

  await page.goto("/pending");
  await expect(
    page.getByRole("row").filter({ hasText: "Mercadinho do Zé" })
  ).toBeVisible();

  await expect(
    page.getByRole("columnheader", { name: "Cliente / responsável" })
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Filtros" }).click();
  const panel = page.locator("[data-filters-panel]");
  await expect(panel.getByPlaceholder("Todos os tipos")).toBeVisible();
  await expect(panel.getByPlaceholder("Toda a empresa")).toHaveCount(0);
});

test("pendências: gestor filtra por vendedor e vê de quem é cada uma", async ({
  page,
}) => {
  await grantRole(page, "OWNER");

  const spy = await mockGraphql(page, {
    MyPendingItems: () => response([item()]),
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

  await page.goto("/pending");

  const row = page.getByRole("row").filter({ hasText: "Mercadinho do Zé" });
  await expect(row).toContainText("João Sacramento");

  await page.getByRole("button", { name: "Filtros" }).click();
  const vendedor = page
    .locator("[data-filters-panel]")
    .getByPlaceholder("Toda a empresa");
  await vendedor.click();
  await page
    .locator("[data-select-dropdown]")
    .getByText("Mariana Souza", { exact: true })
    .click();

  await expect
    .poll(() => spy.lastVariables("MyPendingItems")?.sellerId)
    .toBe("seller-2");
});

test("pendências: lista vazia é boa notícia, não erro", async ({ page }) => {
  await mockGraphql(page, { MyPendingItems: () => response([]) });

  await page.goto("/pending");

  await expect(page.getByText("Nada pendente")).toBeVisible();
  // Os contadores continuam lá, zerados: sumir pareceria defeito.
  const counters = page.locator('[data-tour="pending-counts"]');
  await expect(counters.getByText("Atrasadas")).toBeVisible();
  await expect(counters.getByText("Hoje")).toBeVisible();
  await expect(counters.getByText("Próximos 7 dias")).toBeVisible();
  // "Sem prazo" só aparece quando há cadastro a corrigir.
  await expect(counters.getByText("Sem prazo")).toHaveCount(0);
});

test("pendências: o contador filtra a lista pelo prazo e fica na URL", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    MyPendingItems: (variables) =>
      response([item(), order(), comeBack()], variables),
  });

  await page.goto("/pending");
  const counters = page.locator('[data-tour="pending-counts"]');
  // Visita e pedido venceram; o retorno é da semana que vem.
  await expect(
    counters.getByRole("button", { name: /2\s*Atrasadas/ })
  ).toBeVisible();

  await counters.getByRole("button", { name: /Próximos 7 dias/ }).click();

  await expect
    .poll(() => spy.lastVariables("MyPendingItems")?.when)
    .toBe("NEXT_7_DAYS");
  await expect(page).toHaveURL(/when=NEXT_7_DAYS/);
  await expect(
    page.getByRole("row").filter({ hasText: "Mercadinho do Zé" })
  ).toHaveCount(0);
  await expect(
    counters.getByRole("button", { name: /Próximos 7 dias/ })
  ).toHaveAttribute("aria-pressed", "true");

  // O mesmo clique desfaz.
  await counters.getByRole("button", { name: /Próximos 7 dias/ }).click();
  await expect.poll(() => spy.lastVariables("MyPendingItems")?.when).toBeNull();
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

test("pendências: boleto vencido tem seção própria, sem perder a prioridade", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    MyPendingItems: (variables) =>
      response([item(), boleto(), address()], variables),
  });

  await page.goto("/pending");

  // Na seção de compromissos o boleto não empurra a visita — mas a cobrança
  // fica à vista, com a contagem no botão.
  await expect(
    page.getByRole("row").filter({ hasText: "Mercadinho do Zé" })
  ).toBeVisible();
  await expect(
    page.getByRole("row").filter({ hasText: "Armazém Bahia" })
  ).toHaveCount(0);
  const sections = page.locator('[data-tour="pending-sections"]');
  await expect(
    sections.getByRole("button", { name: "Compromissos (2)" })
  ).toHaveAttribute("aria-pressed", "true");

  await sections.getByRole("button", { name: "Cobranças (1)" }).click();

  await expect
    .poll(() => spy.lastVariables("MyPendingItems")?.types)
    .toEqual(["INSTALLMENT_OVERDUE"]);
  await expect(page).toHaveURL(/section=charges/);

  const row = page.getByRole("row").filter({ hasText: "Armazém Bahia" });
  await expect(row).toContainText("Boleto vencido");
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
  await expect(
    page.getByRole("row").filter({ hasText: "Mercadinho do Zé" })
  ).toHaveCount(0);
});

test("pendências: link de boleto (type=INSTALLMENT_OVERDUE) abre em Cobranças", async ({
  page,
}) => {
  await mockGraphql(page, {
    MyPendingItems: (variables) => response([item(), boleto()], variables),
  });

  await page.goto("/pending?type=INSTALLMENT_OVERDUE");

  await expect(
    page
      .locator('[data-tour="pending-sections"]')
      .getByRole("button", { name: /Cobranças/ })
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("row").filter({ hasText: "Armazém Bahia" })
  ).toBeVisible();
});

test("pendências: endereço a corrigir não tem prazo e leva ao cadastro", async ({
  page,
}) => {
  await mockGraphql(page, {
    MyPendingItems: (variables) => response([address()], variables),
  });

  await page.goto("/pending");

  const row = page.getByRole("row").filter({ hasText: "Comercial Souza" });
  await expect(row).toContainText("Endereço a corrigir");
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
  await mockGraphql(page, {
    MyPendingItems: () =>
      response([
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
      ]),
  });

  await page.goto("/pending");

  const frequency = page.getByRole("row").filter({ hasText: "Loja Central" });
  await expect(frequency).toContainText("Frequência de visita vencida");
  await expect(frequency).toContainText(
    "Última visita em 17/08/2026, há 55 dias"
  );
  await expect(frequency).toContainText("a cada 45 dias");

  const unanswered = page
    .getByRole("row")
    .filter({ hasText: "Mercadinho do Zé" });
  await expect(unanswered).toContainText("Visita sem resposta");
});

test("pendências: entrega sem confirmar traz o WhatsApp do pós-venda", async ({
  page,
}) => {
  await mockGraphql(page, {
    MyPendingItems: () =>
      response([
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
      ]),
  });

  await page.goto("/pending");

  const whatsapp = page.getByRole("row").getByRole("link", {
    name: /Perguntar pelo WhatsApp se o pedido de Decore/,
  });
  const href = await whatsapp.getAttribute("href");
  expect(href).toContain("https://wa.me/5571999998888?text=");
  expect(decodeURIComponent(href!.split("text=")[1])).toContain(
    "o pedido da Herc feito em 30/07/2026 já foi entregue"
  );

  // Sem celular não há WhatsApp: o caminho é cadastrar o contato.
  await expect(
    page.getByRole("row").getByRole("link", { name: "Cadastrar contato" })
  ).toHaveAttribute("href", "/clients/cc-2");
});

test("pendências: no celular a linha vira cartão, com prazo e ação à vista", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockGraphql(page, { MyPendingItems: () => response([order()]) });

  await page.goto("/pending");

  // A tabela some; o cartão mostra o mesmo — sem rolar para o lado.
  await expect(page.getByRole("table")).toBeHidden();
  const card = page.getByRole("listitem").filter({ hasText: "Decore Casa" });
  await expect(card.getByText("venceu há 2 dias")).toBeVisible();
  await expect(card.getByRole("link", { name: "Abrir pedido" })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
