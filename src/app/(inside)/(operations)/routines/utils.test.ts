import { describe, expect, it } from "vitest";

import { VisitScheduleItem } from "./interface";
import {
  getVisitFollowupWarning,
  getVisitScoreTotal,
  isPastDay,
} from "./utils";

const factory = (id: string) => ({
  id,
  nomeFantasia: `Fábrica ${id}`,
  razaoSocial: `Fábrica ${id} LTDA`,
});

const item = (over: Partial<VisitScheduleItem> = {}): VisitScheduleItem => ({
  id: "it-1",
  plannedOrder: 1,
  contactType: "IN_PERSON",
  estimatedTravelMin: null,
  status: "PENDING",
  outcome: null,
  notes: null,
  focusFactories: [],
  treatedFactories: [],
  clientFactoryLink: null,
  ...over,
});

describe("getVisitScoreTotal", () => {
  it("usa o maior score entre as fábricas em foco", () => {
    const visit = item({
      focusFactories: [
        { scoreTotal: "20.00", factory: factory("a") },
        { scoreTotal: "90.00", factory: factory("b") },
      ],
    });

    expect(getVisitScoreTotal(visit)).toBe(90);
  });

  // O bug que motivou o helper: o vínculo apontava para uma fábrica fria e o card
  // mostrava 20 numa visita que existia por causa de um score 90.
  it("ignora o score do vínculo quando há foco", () => {
    const visit = item({
      focusFactories: [{ scoreTotal: "90.00", factory: factory("b") }],
      clientFactoryLink: {
        id: "cfl-1",
        client: null,
        factory: factory("a"),
        latestVisitScore: { scoreTotal: "20.00" },
      },
    });

    expect(getVisitScoreTotal(visit)).toBe(90);
  });

  it("cai no vínculo nas visitas antigas, sem foco", () => {
    const visit = item({
      clientFactoryLink: {
        id: "cfl-1",
        client: null,
        factory: factory("a"),
        latestVisitScore: { scoreTotal: "33.00" },
      },
    });

    expect(getVisitScoreTotal(visit)).toBe(33);
  });

  it("devolve null quando não há score em lugar nenhum", () => {
    expect(getVisitScoreTotal(item())).toBeNull();
    expect(
      getVisitScoreTotal(
        item({ focusFactories: [{ scoreTotal: null, factory: factory("a") }] })
      )
    ).toBeNull();
  });
});

describe("getVisitFollowupWarning", () => {
  it("não avisa em visita que ainda não foi concluída", () => {
    expect(getVisitFollowupWarning(item({ status: "PENDING" }))).toBeNull();
  });

  it("avisa quando a visita concluída não deixou estoque nem resultado", () => {
    const warning = getVisitFollowupWarning(item({ status: "COMPLETED" }));

    expect(warning).not.toBeNull();
    expect(warning?.needsStock).toBe(true);
    expect(warning?.needsOrder).toBe(true);
  });

  // Basta UMA das duas: quem levantou o estoque de alguma fábrica já deixou
  // informação para a próxima rotina, mesmo sem fechar pedido.
  it("silencia quando alguma fábrica foi tratada", () => {
    const visit = item({
      status: "COMPLETED",
      treatedFactories: [factory("a")],
    });

    expect(getVisitFollowupWarning(visit)).toBeNull();
  });

  it("silencia quando houve resultado, mesmo sem estoque", () => {
    const visit = item({ status: "COMPLETED", outcome: "SOLD" });

    expect(getVisitFollowupWarning(visit)).toBeNull();
  });
});

describe("isPastDay", () => {
  const HOJE = "2026-07-29";

  it("dia anterior a hoje já passou", () => {
    expect(isPastDay("2026-07-28", HOJE)).toBe(true);
  });

  it("hoje não é passado — a rota do dia ainda pode ser gerada", () => {
    expect(isPastDay(HOJE, HOJE)).toBe(false);
  });

  it("dia futuro não é passado", () => {
    expect(isPastDay("2026-07-30", HOJE)).toBe(false);
  });

  it("compara pelo calendário, não pelo mês/dia soltos", () => {
    expect(isPastDay("2025-12-31", HOJE)).toBe(true);
    expect(isPastDay("2027-01-01", HOJE)).toBe(false);
  });
});
