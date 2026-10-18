import { describe, expect, it } from "vitest";

import { PriorityClient, WeekSelection } from "./interface";
import {
  buildPlanWeekInput,
  defaultWorkDays,
  groupByRegion,
  mainReason,
  scheduledLabel,
  selectionPhrase,
  weekDates,
} from "./utils";

const client = (over: Partial<PriorityClient>): PriorityClient => ({
  clientId: over.clientId ?? Math.random().toString(36).slice(2),
  name: "Cliente",
  neighborhood: null,
  regionKey: "salvador|BA",
  cityLabel: "Salvador - BA",
  latitude: null,
  longitude: null,
  score: 50,
  rank: 1,
  tier: "TOP",
  suggestedContactType: "IN_PERSON",
  isForced: false,
  availableFrom: null,
  focusLinks: [],
  scheduled: [],
  ...over,
});

describe("groupByRegion", () => {
  const ssa1 = client({ clientId: "a", rank: 3, tier: "HIGH" });
  const cam = client({
    clientId: "b",
    rank: 1,
    regionKey: "camacari|BA",
    cityLabel: "Camaçari - BA",
  });
  const ssa2 = client({
    clientId: "c",
    rank: 2,
    tier: "TOP",
    name: "Lojão Barra",
  });
  const calmo = client({ clientId: "d", rank: 9, tier: "NORMAL" });

  it("a cidade do cliente mais urgente vem primeiro, e dentro dela a ordem da fila", () => {
    const groups = groupByRegion([ssa1, cam, ssa2], "all", "", {});
    expect(groups.map((g) => g.label)).toEqual([
      "Camaçari - BA",
      "Salvador - BA",
    ]);
    expect(groups[1].clients.map((c) => c.clientId)).toEqual(["c", "a"]);
    expect(groups[1].topCount).toBe(1);
  });

  it("Prioritários esconde quem pode esperar, mas nunca o que já foi escolhido", () => {
    expect(groupByRegion([calmo], "priority", "", {})).toEqual([]);
    const escolhido: WeekSelection = {
      d: { contactType: "REMOTE", weekday: null },
    };
    expect(groupByRegion([calmo], "priority", "", escolhido)).toHaveLength(1);
  });

  it("quem pediu visita aparece em Prioritários mesmo no fim da fila", () => {
    const pediu = client({ tier: "NORMAL", isForced: true });
    expect(groupByRegion([pediu], "priority", "", {})).toHaveLength(1);
  });

  it("a busca ignora acento e caixa e procura na carteira inteira", () => {
    const groups = groupByRegion([ssa1, ssa2, calmo], "priority", "lojao", {});
    expect(groups.flatMap((g) => g.clients.map((c) => c.clientId))).toEqual([
      "c",
    ]);
  });
});

describe("buildPlanWeekInput", () => {
  const setup = {
    weekStart: "2026-10-19",
    days: ["2026-10-19", "2026-10-20"],
    visitsPerDay: 4,
    callsPerDay: 2,
    fillWithSuggestions: true,
  };

  it("manda a configuração inteira e as paradas na ordem da fila", () => {
    const clients = [
      client({ clientId: "x", rank: 2 }),
      client({ clientId: "y", rank: 1 }),
    ];
    const selection: WeekSelection = {
      x: { contactType: "IN_PERSON", weekday: null },
      y: { contactType: "REMOTE", weekday: 3 },
    };
    const input = buildPlanWeekInput(
      null,
      setup,
      selection,
      clients,
      "2026-10-18",
      true
    );
    expect(input).toEqual({
      weekStart: "2026-10-19",
      // Quarta (3) da semana configurada.
      stops: [
        { clientId: "y", contactType: "REMOTE", date: "2026-10-21" },
        { clientId: "x", contactType: "IN_PERSON", date: null },
      ],
      days: setup.days,
      visitsPerDay: 4,
      callsPerDay: 2,
      fillWithSuggestions: true,
      dryRun: true,
    });
    expect(
      buildPlanWeekInput("s1", setup, {}, [], "2026-10-18", false).sellerId
    ).toBe("s1");
  });

  it("dia da semana que já passou volta para o sistema escolher", () => {
    const input = buildPlanWeekInput(
      null,
      setup,
      { x: { contactType: "IN_PERSON", weekday: 1 } },
      [client({ clientId: "x" })],
      "2026-10-21",
      true
    );
    expect(input.stops[0].date).toBeNull();
  });
});

describe("semana", () => {
  it("oferece segunda a sexta, menos o que já passou", () => {
    expect(defaultWorkDays("2026-10-19", "2026-10-21")).toEqual([
      "2026-10-21",
      "2026-10-22",
      "2026-10-23",
    ]);
  });

  it("a semana tem sete dias a partir da segunda", () => {
    const dias = weekDates("2026-10-19");
    expect(dias).toHaveLength(7);
    expect(dias[6]).toBe("2026-10-25");
  });
});

describe("frases", () => {
  it("resume a escolha sem a parte zerada", () => {
    expect(
      selectionPhrase({ a: { contactType: "IN_PERSON", weekday: null } })
    ).toBe("1 visita");
    expect(
      selectionPhrase({
        a: { contactType: "IN_PERSON", weekday: null },
        b: { contactType: "IN_PERSON", weekday: null },
        c: { contactType: "REMOTE", weekday: null },
      })
    ).toBe("2 visitas e 1 contato");
  });

  it("diz onde o cliente já está na semana", () => {
    expect(scheduledLabel([])).toBeNull();
    expect(
      scheduledLabel([
        {
          itemId: "1",
          date: "2026-10-20",
          contactType: "IN_PERSON",
          status: "PENDING",
        },
      ])
    ).toBe("visita ter 20 out");
  });
});

describe("mainReason", () => {
  it("é o motivo que mais pesa na fábrica mais urgente", () => {
    const dims = (total: string, urgency: string) => ({
      scoreTotal: total,
      scoreUrgency: urgency,
      scorePriority: "0",
      scoreFrequency: "0",
      scorePotential: "0",
      scoreRecency: "20",
      stockConfidence: "confirmado" as const,
    });
    const result = mainReason(
      client({
        focusLinks: [
          {
            id: "1",
            factory: { id: "f1", nomeFantasia: "Calma", razaoSocial: null },
            latestVisitScore: dims("20", "0"),
          },
          {
            id: "2",
            factory: { id: "f2", nomeFantasia: "Telhas", razaoSocial: null },
            latestVisitScore: dims("70", "90"),
          },
        ],
      })
    );
    expect(result?.factory).toBe("Telhas");
    expect(result?.reason.key).toBe("scoreUrgency");
  });

  it("sem score calculado não inventa motivo", () => {
    expect(mainReason(client({}))).toBeNull();
  });
});
