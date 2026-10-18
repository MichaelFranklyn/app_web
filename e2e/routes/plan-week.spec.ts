import { getCurrentWeekMondayIso } from "@/utils/format/date";
import { expect, test } from "../support/fixtures";
import { emptyConnection, mockGraphql } from "../support/graphql";

/**
 * "Montar semana" (/routines/plan) — o vendedor escolhe os clientes e o
 * sistema monta o caminho. Guarda o caminho inteiro: a lista agrupada por
 * cidade, o filtro de prioritários, a escolha de visita × contato, a prévia
 * (dryRun) e a gravação, que leva de volta para a Agenda na mesma semana.
 */
const WEEK = getCurrentWeekMondayIso();
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
      ? "Prévia: 1 visita e 1 contato em 1 dia."
      : "Semana montada: 1 visita e 1 contato em 1 dia.",
    data: {
      weekStart: WEEK,
      added: 2,
      skipped: [],
      days: [
        {
          date: day(0),
          visitCount: 1,
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
            },
            {
              clientId: "c-2",
              name: "Lojão Barra",
              cityLabel: "Salvador - BA",
              neighborhood: "CENTRO",
              contactType: "REMOTE",
              isNew: true,
            },
          ],
        },
        {
          date: day(1),
          visitCount: 0,
          callCount: 0,
          estimatedKm: null,
          stops: [],
        },
      ],
    },
  },
});

test("montar semana: escolher, conferir a prévia e gravar", async ({
  page,
}) => {
  const spy = await mockGraphql(page, {
    PriorityClients: priorityClients,
    PlanWeek: (variables) =>
      plan(Boolean((variables.input as { dryRun?: boolean }).dryRun)),
    RoutineSellersOptions: () => ({ routine_sellers: { edges: [] } }),
    VisitSchedules: () => ({ visit_schedules: emptyConnection() }),
    VisitScheduleConfig: () => ({
      visit_schedule_configs: {
        edges: [{ node: { id: "cfg-1", sellerId: "s-1", maxVisitsPerDay: 4 } }],
      },
    }),
  });

  await page.goto(`/routines/plan?week=${WEEK}`);
  await expect(
    page.getByRole("heading", { name: "Montar semana" })
  ).toBeVisible();

  // Agrupado por cidade; "Pode esperar" fica escondido em Prioritários.
  await expect(page.getByText("Camaçari - BA", { exact: true })).toBeVisible();
  await expect(page.getByText("Casa Tranquila")).toHaveCount(0);
  await page.getByRole("button", { name: "Toda a carteira" }).click();
  await expect(page.getByText("Casa Tranquila")).toBeVisible();

  await page
    .getByRole("checkbox", { name: "Escolher Del Atacadista" })
    .check({ force: true });
  await page
    .getByRole("checkbox", { name: "Escolher Lojão Barra" })
    .check({ force: true });
  await page
    .getByRole("group", { name: "Como falar com Lojão Barra" })
    .getByRole("button", { name: "Contato" })
    .click();
  await expect(page.getByText("2 clientes escolhidos")).toBeVisible();

  await page.getByRole("button", { name: "Ver como fica a semana" }).click();
  const preview = await spy.waitForCall("PlanWeek");
  expect(preview.input).toMatchObject({
    weekStart: WEEK,
    dryRun: true,
    stops: [
      { clientId: "c-1", contactType: "IN_PERSON", date: null },
      { clientId: "c-2", contactType: "REMOTE", date: null },
    ],
  });
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Del Atacadista")).toBeVisible();
  // Dia sem nada não vira cartão: sai numa linha só.
  await expect(dialog.getByText(/Dias livres:/)).toBeVisible();

  await dialog.getByRole("button", { name: "Confirmar semana" }).click();
  await expect(page).toHaveURL(new RegExp(`/routines\\?week=${WEEK}$`));
  const saved = spy.lastVariables("PlanWeek");
  expect((saved?.input as { dryRun: boolean }).dryRun).toBe(false);
  await expect(
    page.getByRole("heading", { name: "Agenda", level: 1 })
  ).toBeVisible();
});
