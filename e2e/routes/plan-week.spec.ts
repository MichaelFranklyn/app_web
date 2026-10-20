import { getCurrentWeekMondayIso } from "@/utils/format/date";
import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";
import { grantRole } from "../support/role";

/**
 * "Montar semana" (/agenda/plan) — o vendedor escolhe os clientes e o
 * sistema monta o caminho. Guarda o caminho inteiro: a lista agrupada por
 * cidade, o filtro de prioritários, a escolha de visita × contato, a prévia
 * (dryRun) e a gravação, que leva de volta para a Agenda na mesma semana.
 */
const WEEK = getCurrentWeekMondayIso();
const NEXT_WEEK = (() => {
  const d = new Date(`${WEEK}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 7);
  return d.toISOString().slice(0, 10);
})();
const day = (offset: number) => {
  const d = new Date(`${WEEK}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
};

const client = (
  clientId: string,
  name: string,
  city: string,
  rank: number,
  tier: "TOP" | "HIGH" | "NORMAL"
) => ({
  clientId,
  name,
  neighborhood: "CENTRO",
  regionKey: `${city.toLowerCase()}|BA`,
  cityLabel: `${city} - BA`,
  latitude: -12.9,
  longitude: -38.5,
  score: 80 - rank,
  rank,
  tier,
  suggestedContactType: tier === "NORMAL" ? "REMOTE" : "IN_PERSON",
  isForced: false,
  availableFrom: null,
  focusLinks: [],
  scheduled: [],
});

const priorityClients = () => ({
  priority_clients: {
    weekStart: WEEK,
    openDates: [day(0), day(1), day(2), day(3), day(4)],
    workDates: [day(0), day(1), day(2), day(3), day(4)],
    clients: [
      client("c-1", "Del Atacadista", "Camaçari", 1, "TOP"),
      client("c-2", "Lojão Barra", "Salvador", 2, "HIGH"),
      client("c-3", "Casa Tranquila", "Salvador", 3, "NORMAL"),
    ],
    unavailable: [
      {
        clientId: "c-9",
        name: "Hiperferro",
        cityLabel: "Salvador - BA",
        reason: "OPEN_ORDER",
        until: null,
      },
    ],
  },
});

const plan = (dryRun: boolean) => ({
  planWeek: {
    status: true,
    message: dryRun
      ? "Prévia: 2 visitas e 1 ligação em 1 dia."
      : "Semana montada: 2 visitas e 1 ligação em 1 dia.",
    data: {
      weekStart: NEXT_WEEK,
      added: 3,
      ignoredDays: [],
      skipped: [],
      days: [
        {
          date: NEXT_WEEK,
          visitCount: 2,
          callCount: 1,
          estimatedKm: 0,
          stops: [
            {
              clientId: "c-1",
              name: "Del Atacadista",
              cityLabel: "Camaçari - BA",
              neighborhood: "CENTRO",
              contactType: "IN_PERSON",
              isNew: true,
              isSuggested: false,
            },
            {
              clientId: "c-2",
              name: "Lojão Barra",
              cityLabel: "Salvador - BA",
              neighborhood: "CENTRO",
              contactType: "REMOTE",
              isNew: true,
              isSuggested: false,
            },
            {
              clientId: "c-3",
              name: "Casa Tranquila",
              cityLabel: "Salvador - BA",
              neighborhood: "CENTRO",
              contactType: "IN_PERSON",
              isNew: true,
              isSuggested: true,
            },
          ],
        },
      ],
    },
  },
});

const scheduledVisits = () => ({
  scheduledVisits: [
    {
      itemId: "it-9",
      clientId: "c-9",
      clientName: "Hiperferro",
      cityLabel: "Salvador - BA",
      neighborhood: "CALÇADA",
      date: NEXT_WEEK,
      contactType: "IN_PERSON",
    },
  ],
});

const mocks = () => ({
  PriorityClients: priorityClients,
  ScheduledVisits: scheduledVisits,
  PlanWeek: (variables: Record<string, unknown>) =>
    plan(Boolean((variables.input as { dryRun?: boolean }).dryRun)),
  RoutineSellersOptions: () => ({ routine_sellers: { edges: [] } }),
  VisitSchedules: () => ({ visit_schedules: emptyConnection() }),
  VisitScheduleConfig: () => ({
    visit_schedule_configs: {
      edges: [{ node: { id: "cfg-1", sellerId: "s-1", maxVisitsPerDay: 4 } }],
    },
  }),
});

test("montar semana: escolher, configurar a semana, organizar e confirmar", async ({
  page,
}) => {
  const spy = await mockGraphql(page, mocks());

  await page.goto(`/agenda/plan?week=${WEEK}`);
  await expect(
    page.getByRole("heading", { name: "Montar semana" })
  ).toBeVisible();
  // A tela não navega por semana: a semana é da configuração.
  await expect(
    page.getByRole("button", { name: "Próxima semana" })
  ).toHaveCount(0);

  // Agrupado por cidade; "Pode esperar" fica escondido em Prioritários.
  await expect(page.getByText("Camaçari - BA", { exact: true })).toBeVisible();
  await expect(page.getByText("Casa Tranquila")).toHaveCount(0);
  await page.getByRole("button", { name: "Toda a carteira" }).click();
  await expect(page.getByText("Casa Tranquila")).toBeVisible();

  await page
    .getByRole("checkbox", { name: "Escolher Del Atacadista" })
    .check({ force: true });
  // A linha inteira marca o cliente, não só a caixinha.
  await page.getByText("Lojão Barra", { exact: true }).click();
  await expect(
    page.getByRole("checkbox", { name: "Escolher Lojão Barra" })
  ).toBeChecked();
  await page
    .getByRole("group", { name: "Como falar com Lojão Barra" })
    .getByRole("button", { name: "Ligação" })
    .click();
  // O painel "Sua semana" junta os escolhidos de todas as cidades.
  await expect(page.getByText("Escolhidos agora (2)")).toBeVisible();
  // O guia passa para o passo 2 e diz o que foi escolhido.
  await expect(
    page.getByText("Você escolheu 1 visita e 1 ligação.")
  ).toBeVisible();
  // No desktop as ações estão no painel: a barra fixa é do celular.
  await expect(
    page.getByRole("region", { name: "Ações da seleção" })
  ).toBeHidden();

  await page.getByRole("button", { name: "Organizar a semana" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Semana que vem" }).click();
  await dialog.getByLabel("Visitas por dia").fill("3");
  await dialog.getByLabel("Ligações por dia").fill("1");
  await dialog
    .getByRole("checkbox", {
      name: "Sim, completar os dias com os clientes mais urgentes",
    })
    .check({ force: true });
  await dialog.getByRole("button", { name: "Organizar a semana" }).click();

  const preview = await spy.waitForCall("PlanWeek");
  expect(preview.input).toMatchObject({
    weekStart: NEXT_WEEK,
    dryRun: true,
    visitsPerDay: 3,
    callsPerDay: 1,
    fillWithSuggestions: true,
    stops: [
      { clientId: "c-1", contactType: "IN_PERSON", date: null },
      { clientId: "c-2", contactType: "REMOTE", date: null },
    ],
  });
  await expect(dialog.getByText("Como fica a sua semana")).toBeVisible();
  await expect(dialog.getByText("Sugerido")).toBeVisible();

  await dialog.getByRole("button", { name: "Confirmar semana" }).click();
  await expect(page).toHaveURL(new RegExp(`/agenda\\?week=${NEXT_WEEK}$`));
  const saved = spy.lastVariables("PlanWeek");
  expect((saved?.input as { dryRun: boolean }).dryRun).toBe(false);
  await expect(
    page.getByRole("heading", { name: "Agenda", level: 1 })
  ).toBeVisible();
});

test("organizar sem escolher ninguém: o sistema monta com os mais urgentes", async ({
  page,
}) => {
  const spy = await mockGraphql(page, mocks());

  await page.goto(`/agenda/plan?week=${WEEK}`);
  // Passo 1 do guia: sem ninguém escolhido, a saída é deixar o sistema escolher.
  await expect(
    page.getByText("Toque nos clientes que você quer ver nesta semana.")
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Ou deixe o sistema escolher" })
    .click();
  const dialog = page.getByRole("dialog");
  // Sem ninguém escolhido, completar já vem ligado.
  await expect(
    dialog.getByRole("checkbox", {
      name: "Sim, completar os dias com os clientes mais urgentes",
    })
  ).toBeChecked();
  await dialog.getByRole("button", { name: "Organizar a semana" }).click();

  const call = await spy.waitForCall("PlanWeek");
  expect(call.input).toMatchObject({ stops: [], fillWithSuggestions: true });
});

test("cidades sempre abertas: o filtro de cidade e o painel dos escolhidos", async ({
  page,
}) => {
  await mockGraphql(page, mocks());

  await page.goto(`/agenda/plan?week=${WEEK}`);
  // Nenhuma cidade fechada: os clientes das duas aparecem de cara.
  await expect(page.getByText("Del Atacadista", { exact: true })).toBeVisible();
  await expect(page.getByText("Lojão Barra", { exact: true })).toBeVisible();

  await page
    .getByRole("checkbox", { name: "Escolher Del Atacadista" })
    .check({ force: true });
  const cities = page.getByRole("group", { name: "Cidade" });
  await cities.getByRole("button", { name: "Salvador - BA (1)" }).click();
  await expect(
    page.getByRole("checkbox", { name: "Escolher Del Atacadista" })
  ).toHaveCount(0);
  // Fora da lista pelo filtro, mas segue escolhido no painel.
  await expect(page.getByText("Escolhidos agora (1)")).toBeVisible();

  await page.getByRole("button", { name: "Tirar Del Atacadista" }).click();
  await expect(
    page.getByText("Ninguém ainda. Toque nos clientes da lista.")
  ).toBeVisible();

  await cities.getByRole("button", { name: "Todas (2)" }).click();
  await expect(page.getByText("Del Atacadista", { exact: true })).toBeVisible();
});

test("visitas marcadas: o que já está combinado aparece, com Marcar visita", async ({
  page,
}) => {
  await mockGraphql(page, mocks());

  await page.goto(`/agenda/plan?week=${WEEK}`);
  await expect(page.getByText("Visitas marcadas (1)")).toBeVisible();
  await expect(page.getByText("Hiperferro")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Marcar visita" })
  ).toBeVisible();
});

test("agenda: sem marcar visita nem planejar viagem no cabeçalho", async ({
  page,
}) => {
  // A agenda lê o papel do token (servidor); a do vendedor é a que tem o
  // "Montar semana" sem escolher pessoa.
  await grantRole(page, "SELLER", { alsoJwt: true });
  await mockGraphql(page, mocks());

  await page.goto("/agenda");
  await expect(
    page.getByRole("heading", { name: "Agenda", level: 1 })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Montar semana" }).first()
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Marcar visita" })).toHaveCount(
    0
  );
  await expect(
    page.getByRole("button", { name: "Planejar viagem" })
  ).toHaveCount(0);
});
