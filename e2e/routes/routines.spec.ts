import { getCurrentWeekMondayIso, getTodayIso } from "@/utils/format/date";
import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

// `useRoutines` lê `visit_schedule_configs.edges[0]` — o campo é não-nulo no
// schema, então sem handler o fallback `{}` derruba a página inteira.
const scheduleConfig = () => ({
  visit_schedule_configs: {
    edges: [{ node: { id: "cfg-1", sellerId: "s-1", maxVisitsPerDay: 8 } }],
  },
});

test("routines: a rotina da semana carrega sem agendamentos", async ({
  page,
}) => {
  await mockGraphql(page, {
    RoutineSellersOptions: () => ({ routine_sellers: { edges: [] } }),
    VisitSchedules: () => ({ visit_schedules: emptyConnection() }),
    VisitScheduleConfig: scheduleConfig,
  });

  await page.goto("/routines");

  await expect(
    page.getByRole("heading", { name: "Rotina da Semana", level: 1 })
  ).toBeVisible();
});

/**
 * Lote 5 — rotina da semana (/routines). Mock VisitSchedules com 1 visita
 * acionável; o item tem um menu (MoreOptions) → "Editar visita". O EditVisitModal
 * tem status prefilled, então só alteramos as notas (evita o select de status).
 */
// A grade sempre monta a SEMANA CORRENTE (`getCurrentWeekMondayIso`) e casa os
// `days` por data. Uma data fixa aqui só funciona na semana em que foi escrita —
// depois o item cai fora da grade e o card não renderiza. Ancorar em "hoje".
const WEEK_START = getCurrentWeekMondayIso();

const schedule = {
  id: "sch-1",
  weekStart: WEEK_START,
  status: "CONFIRMED",
  generatedAt: `${WEEK_START}T00:00:00Z`,
  seller: { id: "s-1", user: { name: "João Vendedor" } },
  days: [
    {
      id: "d-1",
      date: WEEK_START,
      status: "PLANNED",
      departureType: "HOME",
      routeDistanceKm: "50.0",
      routeDurationMin: 120,
      items: [
        {
          id: "it-1",
          plannedOrder: 1,
          contactType: "IN_PERSON",
          estimatedTravelMin: 15,
          status: "PENDING",
          outcome: null,
          notes: null,
          focusFactories: [],
          treatedFactories: [],
          clientFactoryLink: {
            id: "cfl-1",
            client: {
              id: "c-1",
              razaoSocial: "Cliente LTDA",
              nomeFantasia: "Meu Cliente",
              primaryContact: null,
            },
            factory: {
              id: "f-1",
              razaoSocial: "Fábrica LTDA",
              nomeFantasia: "Fábrica",
            },
          },
        },
      ],
    },
  ],
};

test("rotina: edita uma visita (notas)", async ({ page }) => {
  await mockGraphql(page, {
    RoutineSellersOptions: () => ({ routine_sellers: { edges: [] } }),
    VisitScheduleConfig: scheduleConfig,
    VisitSchedules: () => ({
      visit_schedules: {
        edges: [{ node: schedule }],
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: 1,
      },
    }),
    UpdateVisitScheduleItem: (v) => ({
      updateVisitScheduleItem: {
        status: true,
        message: "ok",
        data: { id: v.id, ...(v.input as object) },
      },
    }),
  });

  await page.goto("/routines");

  // Kebab DENTRO do card da visita. O `following::button[1]` era ambíguo: o
  // card virou role="button" e há outros botões depois dele no DOM.
  // O card exibe a RAZÃO SOCIAL (`clientDisplayName`), não o nome fantasia.
  const card = page.getByRole("button", { name: /Cliente LTDA/ });
  await card.locator('[aria-haspopup="menu"]').click();
  await page.getByRole("menuitem", { name: "Editar visita" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.locator('[name="notes"]').fill("Visita confirmada por telefone");
  await dialog.getByRole("button", { name: "Salvar alterações" }).click();

  await expect(page.getByText("Visita atualizada")).toBeVisible();
});

// Modo lista: os dias vêm colapsados, só o de hoje abre sozinho. Montamos hoje
// (com uma visita) e outro dia da mesma semana (com outra visita) para provar
// que o de hoje aparece aberto e o outro vem fechado — e que fechar hoje some
// com sua visita.
const addDaysIso = (iso: string, n: number): string => {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
};

const TODAY = getTodayIso();
// Um dia da semana garantidamente diferente de hoje (para vir fechado).
const OTHER_DAY = TODAY === WEEK_START ? addDaysIso(WEEK_START, 1) : WEEK_START;

const visitItem = (id: string, clientName: string) => ({
  id,
  plannedOrder: 1,
  contactType: "IN_PERSON",
  estimatedTravelMin: 15,
  status: "PENDING",
  outcome: null,
  notes: null,
  focusFactories: [],
  treatedFactories: [],
  clientFactoryLink: {
    id: `cfl-${id}`,
    client: {
      id: `c-${id}`,
      razaoSocial: clientName,
      nomeFantasia: null,
      primaryContact: null,
    },
    factory: {
      id: "f-1",
      razaoSocial: "Fábrica LTDA",
      nomeFantasia: "Fábrica",
    },
    latestVisitScore: null,
  },
});

const day = (id: string, date: string, clientName: string) => ({
  id,
  date,
  status: "PLANNED",
  departureType: "HOME",
  routeDistanceKm: "10.0",
  routeDurationMin: 30,
  items: [visitItem(`it-${id}`, clientName)],
});

test("rotina (lista): dias colapsam, só hoje abre sozinho", async ({
  page,
}) => {
  await mockGraphql(page, {
    RoutineSellersOptions: () => ({ routine_sellers: { edges: [] } }),
    VisitScheduleConfig: scheduleConfig,
    VisitSchedules: () => ({
      visit_schedules: {
        edges: [
          {
            node: {
              ...schedule,
              days: [
                day("today", TODAY, "Cliente De Hoje"),
                day("other", OTHER_DAY, "Cliente De Outro Dia"),
              ],
            },
          },
        ],
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: 1,
      },
    }),
  });

  await page.goto("/routines?view=list");

  // O checkbox de concluir só existe nas linhas de visita renderizadas (o painel
  // de detalhes repete o nome do cliente, então ancoramos no checkbox). Hoje vem
  // aberto → 1 linha; o outro dia vem fechado → nada dele no DOM.
  const doneChecks = page.getByLabel("Marcar visita como concluída");
  await expect(doneChecks).toHaveCount(1);
  await expect(page.getByText("Cliente De Outro Dia")).toHaveCount(0);

  // O cabeçalho do dia tem o atalho para a rota daquele dia (mesmo fechado).
  // Ancorado no href do dia de hoje: com dias anteriores na semana, o PRIMEIRO
  // link é o deles — `.first()` só funcionava quando hoje era segunda-feira.
  await expect(
    page
      .getByRole("link", { name: "Ver rota" })
      .and(page.locator(`[href="/routines/${TODAY}"]`))
  ).toBeVisible();

  // Fechar o dia de hoje (único cabeçalho expandido) some com a linha da visita.
  await page.getByRole("button", { expanded: true }).first().click();
  await expect(doneChecks).toHaveCount(0);
});

/**
 * Marcar um dia como não trabalhado.
 *
 * O que este teste protege é a promessa feita ANTES do clique: a confirmação
 * precisa dizer quantas paradas vão sair do dia. Foi por não dizer isso que a
 * ação nasceu com modal em vez de um clique direto — descobrir pelo toast que
 * três visitas mudaram de data é descobrir tarde demais.
 *
 * O dia é o de HOJE, e não a segunda da semana: quando a semana já virou, o dia
 * passado não oferece a ação (marcar ontem não muda nada) e o teste clicaria no
 * botão de outra coluna.
 */
test("rotina: marca um dia como não trabalhado", async ({ page }) => {
  const today = getTodayIso();
  const todaySchedule = {
    ...schedule,
    days: [{ ...schedule.days[0], id: "d-hoje", date: today }],
  };

  const spy = await mockGraphql(page, {
    RoutineSellersOptions: () => ({ routine_sellers: { edges: [] } }),
    VisitScheduleConfig: scheduleConfig,
    VisitSchedules: () => ({
      visit_schedules: {
        edges: [{ node: todaySchedule }],
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: 1,
      },
    }),
    SellerDayOffs: () => ({ seller_day_offs: [] }),
    MarkSellerDayOff: () => ({
      markSellerDayOff: {
        status: true,
        message: "Dia marcado: 1 parada(s) remarcada(s).",
        data: {
          rescheduled: 1,
          released: 0,
          dayOff: { id: "off-1", date: today, reason: null },
        },
      },
    }),
  });

  await page.goto("/routines");

  // A coluna de hoje é a única com visita marcada — e é dela que sai o número
  // que a confirmação precisa mostrar.
  const card = page.getByRole("button", { name: /Cliente LTDA/ });
  await expect(card).toBeVisible();

  // A grade começa em HOJE (`getVisibleCells`), então a primeira coluna é a do
  // dia com a visita mockada.
  await page.getByRole("button", { name: "Não vou trabalhar" }).first().click();

  await expect(page.getByText(/1 parada marcada/)).toBeVisible();

  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Não vou trabalhar" })
    .click();

  const variables = await spy.waitForCall("MarkSellerDayOff");
  expect(variables.date).toBe(today);
});
