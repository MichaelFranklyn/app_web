import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";
import { grantRole } from "../support/role";

/**
 * Contatos agendados (follow-up): a lista e o agendamento aberto.
 *
 * O que estes testes guardam é a promessa da tela: cada contato diz o dia, com
 * quem e por quê; concluir exige o que foi conversado (e pode já marcar o
 * próximo); reagendar guarda a data antiga; e o histórico mostra cada passo.
 */
/** `__typename` é obrigatório: a query usa fragmento (`...FollowUpRow`). */
const followUp = (overrides: Record<string, unknown> = {}) => ({
  __typename: "ClientFollowUpType",
  id: "fu-1",
  clientId: "client-1",
  companyClientId: "cc-1",
  client: {
    __typename: "ClientType",
    id: "client-1",
    razaoSocial: "ARMAZEM CENTRAL LTDA",
    nomeFantasia: "Armazém Central",
  },
  orderId: null,
  order: null,
  responsibleUserId: "user-e2e-1",
  responsible: {
    __typename: "UserType",
    id: "user-e2e-1",
    name: "Celso",
    isActive: true,
  },
  dueDate: "2026-10-08",
  reason: "Retornar sobre o orçamento de tintas",
  notes: null,
  status: "SCHEDULED",
  situation: "OVERDUE",
  daysLate: 3,
  closedAt: null,
  outcome: null,
  rescheduleCount: 2,
  isCommercial: null,
  ...overrides,
});

const list = (nodes: unknown[]) => ({
  follow_ups: {
    edges: nodes.map((node) => ({ node })),
    pageInfo: { hasNextPage: false, endCursor: null },
    totalCount: nodes.length,
  },
});

const counts = () => ({
  clientFollowUpCounts: [
    { situation: "OVERDUE", count: 1 },
    { situation: "TODAY", count: 2 },
    { situation: "UPCOMING", count: 4 },
    { situation: "DONE", count: 9 },
    { situation: "CANCELLED", count: 0 },
  ],
});

const detail = (overrides: Record<string, unknown> = {}) => ({
  clientFollowUp: {
    status: true,
    message: "ok",
    data: {
      ...followUp(),
      createdAt: "2026-10-01T12:00:00Z",
      previousId: null,
      defaultCommercial: true,
      linkedReturn: null,
      openReturn: {
        __typename: "FollowUpReturnType",
        itemId: "item-7",
        returnDate: "2026-10-09",
        agreedOn: "2026-10-02",
      },
      createdBy: { __typename: "UserType", id: "u-9", name: "Calazans" },
      next: null,
      events: [
        {
          __typename: "ClientFollowUpEventType",
          id: "ev-1",
          kind: "CREATED",
          note: null,
          dateFrom: null,
          dateTo: "2026-10-03",
          userFrom: null,
          userTo: { __typename: "UserType", id: "user-e2e-1", name: "Celso" },
          author: { __typename: "UserType", id: "u-9", name: "Calazans" },
          createdAt: "2026-10-01T12:00:00Z",
        },
        {
          __typename: "ClientFollowUpEventType",
          id: "ev-2",
          kind: "RESCHEDULED",
          note: "Não atendeu.",
          dateFrom: "2026-10-03",
          dateTo: "2026-10-08",
          userFrom: null,
          userTo: null,
          author: { __typename: "UserType", id: "user-e2e-1", name: "Celso" },
          createdAt: "2026-10-03T12:00:00Z",
        },
      ],
      ...overrides,
    },
  },
});

const mutationOk = (field: string) => () => ({
  [field]: {
    status: true,
    message: "ok",
    data: { id: "fu-1", status: "DONE", dueDate: "2026-10-08" },
  },
});

test("follow-ups: a lista diz o dia, com quem, o motivo e quantas vezes mudou", async ({
  page,
}) => {
  await mockGraphql(page, {
    ClientFollowUps: () => list([followUp()]),
    ClientFollowUpCounts: () => counts(),
  });
  await page.goto("/follow-ups");

  await expect(
    page.getByRole("heading", { name: "Contatos agendados", level: 1 })
  ).toBeVisible();
  const row = page.getByRole("row").filter({ hasText: "ARMAZEM CENTRAL LTDA" });
  await expect(row).toContainText("Retornar sobre o orçamento de tintas");
  await expect(row).toContainText("08/10/2026");
  await expect(row).toContainText("atrasado há 3 dias");
  await expect(row).toContainText("reagendado 2 vezes");

  // Os recortes trazem a quantidade no próprio botão; "em aberto" soma os três.
  await expect(
    page.getByRole("button", { name: "Em aberto · 7" })
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: "Concluídos · 9" })
  ).toBeVisible();
});

test("follow-ups: escolher um recorte vai ao backend pelo nome", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    ClientFollowUps: () => list([followUp()]),
    ClientFollowUpCounts: () => counts(),
  });
  await page.goto("/follow-ups");

  await page.getByRole("button", { name: "Atrasados · 1" }).click();

  await expect
    .poll(() =>
      spy
        .calls("ClientFollowUps")
        .some((v) =>
          (
            (v.input as { filters?: { field: string; value: string }[] })
              .filters ?? []
          ).some((f) => f.field === "situation" && f.value === "OVERDUE")
        )
    )
    .toBe(true);
  await expect(page).toHaveURL(/situation=OVERDUE/);
});

test("follow-ups: vendedor não vê o filtro nem a coluna de quem faz", async ({
  page,
}) => {
  await grantRole(page, "SELLER");
  const spy = await mockGraphql(page, {
    ClientFollowUps: () => list([followUp()]),
    ClientFollowUpCounts: () => counts(),
  });
  await page.goto("/follow-ups");

  await expect(page.getByText("ARMAZEM CENTRAL LTDA")).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Quem faz" })
  ).toHaveCount(0);
  // `users` é só de gestor: a consulta nem sai (daria 403).
  expect(spy.calls("FollowUpPeople")).toHaveLength(0);
});

test("follow-ups/contato: o histórico mostra o de-para do reagendamento", async ({
  page,
}) => {
  await mockGraphql(page, { ClientFollowUp: () => detail() });
  await page.goto("/follow-ups/fu-1");

  await expect(
    page.getByRole("heading", {
      name: "Retornar sobre o orçamento de tintas",
      level: 1,
    })
  ).toBeVisible();
  await expect(page.getByText("De 03/10/2026 para 08/10/2026.")).toBeVisible();
  await expect(page.getByText("Não atendeu.")).toBeVisible();
  // O cliente leva à ficha pelo id da CARTEIRA (a razão social é o nome
  // canônico na tela).
  await expect(
    page.getByRole("link", { name: "ARMAZEM CENTRAL LTDA" })
  ).toHaveAttribute("href", "/clients/cc-1/overview");
});

test("follow-ups/contato: concluir exige o que foi conversado e pode marcar o próximo", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    ClientFollowUp: () => detail(),
    CompleteClientFollowUp: mutationOk("completeClientFollowUp"),
  });
  await page.goto("/follow-ups/fu-1");

  await page.getByRole("button", { name: "Concluir" }).first().click();
  const dialog = page.getByRole("dialog");
  const confirm = dialog.getByRole("button", { name: "Concluir" });
  await expect(confirm).toBeDisabled();

  await dialog
    .getByLabel(/o que foi conversado/i)
    .fill("Vai ver com o sócio e responde até sexta.");
  // O quadrado desenhado cobre o input nativo: clica-se no rótulo, como a
  // pessoa faria.
  await dialog.getByText("Já agendar o próximo contato").click();
  // Sem dia escolhido, o próximo não pode ir.
  await expect(confirm).toBeDisabled();
  await dialog.getByRole("button", { name: "Em 1 semana" }).click();
  await confirm.click();

  const variables = await spy.waitForCall("CompleteClientFollowUp");
  const input = variables.input as {
    id: string;
    outcome: string;
    nextDueDate: string | null;
    nextReason: string | null;
  };
  expect(input.id).toBe("fu-1");
  expect(input.outcome).toBe("Vai ver com o sócio e responde até sexta.");
  expect(input.nextDueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  // Motivo em branco = o mesmo deste (o backend repete).
  expect(input.nextReason).toBeNull();
});

test("follow-ups/contato: comercial vem marcado para vendedor; o retorno só com confirmação", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    ClientFollowUp: () => detail(),
    CompleteClientFollowUp: mutationOk("completeClientFollowUp"),
  });
  await page.goto("/follow-ups/fu-1");

  await page.getByRole("button", { name: "Concluir" }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByLabel("Foi uma conversa de venda com o cliente")
  ).toBeChecked();
  const fulfills = dialog.getByLabel(
    /atendeu o retorno combinado para 09\/10\/2026/
  );
  // Nasce desmarcada: um contato qualquer não cumpre o combinado sozinho.
  await expect(fulfills).not.toBeChecked();

  await dialog.getByLabel(/o que foi conversado/i).fill("Só o boleto.");
  await dialog.getByText("Foi uma conversa de venda com o cliente").click();
  await dialog.getByRole("button", { name: "Concluir" }).click();

  let input = (await spy.waitForCall("CompleteClientFollowUp")).input as {
    isCommercial: boolean;
    fulfillsReturn: boolean;
  };
  expect(input.isCommercial).toBe(false);
  expect(input.fulfillsReturn).toBe(false);

  await page.getByRole("button", { name: "Concluir" }).first().click();
  await page
    .getByRole("dialog")
    .getByLabel(/o que foi conversado/i)
    .fill("Retornei.");
  await page
    .getByRole("dialog")
    .getByText(/atendeu o retorno combinado/)
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Concluir" })
    .click();

  await expect.poll(() => spy.calls("CompleteClientFollowUp").length).toBe(2);
  input = spy.lastVariables("CompleteClientFollowUp")!.input as typeof input;
  expect(input.isCommercial).toBe(true);
  expect(input.fulfillsReturn).toBe(true);
});

test("follow-ups: gestor vê os contatos de quem saiu e os filtra", async ({
  page,
}) => {
  await grantRole(page, "OWNER");
  const spy = await mockGraphql(page, {
    ClientFollowUps: () =>
      list([
        followUp({
          responsible: {
            __typename: "UserType",
            id: "u-out",
            name: "Bia",
            isActive: false,
          },
        }),
      ]),
    ClientFollowUpCounts: () => counts(),
    ClientFollowUpOrphanCount: () => ({ clientFollowUpOrphanCount: 2 }),
    FollowUpPeople: () => ({ follow_up_people: { edges: [], totalCount: 0 } }),
  });
  await page.goto("/follow-ups");

  await expect(
    page.getByText("2 contatos em aberto estão com quem foi desativado")
  ).toBeVisible();
  await expect(page.getByText("Bia (desativado)")).toBeVisible();

  await page.getByRole("button", { name: "Ver esses contatos" }).click();
  await expect
    .poll(() =>
      spy
        .calls("ClientFollowUps")
        .some((v) =>
          (
            (v.input as { filters?: { field: string; value: string }[] })
              .filters ?? []
          ).some((f) => f.field === "orphaned" && f.value === "true")
        )
    )
    .toBe(true);
});

test("follow-ups/contato: reagendar manda o dia novo e o porquê", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    ClientFollowUp: () => detail(),
    RescheduleClientFollowUp: mutationOk("rescheduleClientFollowUp"),
  });
  await page.goto("/follow-ups/fu-1");

  await page.getByRole("button", { name: "Reagendar" }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Amanhã" }).click();
  await dialog.getByLabel(/por que mudou/i).fill("Pediu para ligar amanhã.");
  await dialog.getByRole("button", { name: "Reagendar" }).click();

  const variables = await spy.waitForCall("RescheduleClientFollowUp");
  const input = variables.input as {
    id: string;
    dueDate: string;
    note: string;
  };
  expect(input.id).toBe("fu-1");
  expect(input.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(input.note).toBe("Pediu para ligar amanhã.");
});

test("follow-ups/contato: encerrado não oferece mais ações", async ({
  page,
}) => {
  await mockGraphql(page, {
    ClientFollowUp: () =>
      detail({
        status: "DONE",
        situation: "DONE",
        outcome: "Fechou o pedido.",
        closedAt: "2026-10-09T12:00:00Z",
      }),
  });
  await page.goto("/follow-ups/fu-1");

  await expect(page.getByText("Fechou o pedido.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Reagendar" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Concluir" })).toHaveCount(0);
});
