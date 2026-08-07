import { describe, expect, it } from "vitest";

import type { ScoreDimensions } from "@/utils/score";
import { VisitScheduleItem } from "./interface";
import {
  formatTravelToStop,
  formatVisitSlot,
  getVisitFollowupWarning,
  getVisitScoreReasons,
  getVisitScoreTotal,
  isPastDay,
} from "./utils";

const factory = (id: string) => ({
  id,
  nomeFantasia: `Fábrica ${id}`,
  razaoSocial: `Fábrica ${id} LTDA`,
});

// Dimensões zeradas: cada teste liga só o fator que quer explicar.
const score = (over: Partial<ScoreDimensions> = {}): ScoreDimensions => ({
  scoreTotal: "0",
  scoreUrgency: "0",
  scorePriority: "0",
  scoreFrequency: "0",
  scorePotential: "0",
  scoreRecency: "0",
  // Estoque confirmado por padrão: mantém os pesos nominais e deixa cada teste
  // isolar o fator que quer explicar. Sem lastro a urgência contribui zero e
  // some da lista de motivos (ver @/utils/score).
  stockConfidence: "confirmado",
  ...over,
});

const item = (over: Partial<VisitScheduleItem> = {}): VisitScheduleItem => ({
  id: "it-1",
  plannedOrder: 1,
  contactType: "IN_PERSON",
  estimatedTravelMin: null,
  plannedStartTime: null,
  plannedEndTime: null,
  visitDurationMin: null,
  status: "PENDING",
  outcome: null,
  notes: null,
  focusFactories: [],
  treatedFactories: [],
  clientFactoryLink: null,
  ...over,
});

describe("getVisitScoreTotal", () => {
  // Foco com score de hoje: é o formato que a rotina gerada pelo motor atual
  // produz, e o único que o painel de detalhe sabe explicar.
  const liveFocus = (id: string, total: string, frozen = total) => ({
    scoreTotal: frozen,
    factory: factory(id),
    clientFactoryLink: {
      id: `cfl-${id}`,
      latestVisitScore: score({ scoreTotal: total }),
    },
  });

  it("usa o maior score entre as fábricas em foco", () => {
    const visit = item({
      focusFactories: [liveFocus("a", "20.00"), liveFocus("b", "90.00")],
    });

    expect(getVisitScoreTotal(visit)).toBe(90);
  });

  // O bug que motivou o helper: o vínculo apontava para uma fábrica fria e o card
  // mostrava 20 numa visita que existia por causa de um score 90.
  it("ignora o score do vínculo quando há foco", () => {
    const visit = item({
      focusFactories: [liveFocus("b", "90.00")],
      clientFactoryLink: {
        id: "cfl-1",
        client: null,
        factory: factory("a"),
        latestVisitScore: score({ scoreTotal: "20.00" }),
      },
    });

    expect(getVisitScoreTotal(visit)).toBe(90);
  });

  // O caso real: rotina gerada em 04/08 com score 62, executada na semana
  // seguinte com o cliente já em 41. O card dizia "Urgente · 62" e o painel logo
  // abaixo dizia "Atenção · 41" — para a mesma visita.
  it("mostra o score de hoje, não o congelado na geração da rotina", () => {
    const visit = item({
      focusFactories: [liveFocus("a", "41.20", "62.00")],
    });

    expect(getVisitScoreTotal(visit)).toBe(41.2);
  });

  // Misturar as escalas faria o Math.max premiar justamente o congelado alto que
  // o painel não lista — a divergência voltaria por outro caminho.
  it("não deixa um congelado alto vencer o score atual de outro foco", () => {
    const visit = item({
      focusFactories: [
        liveFocus("a", "30.00"),
        { scoreTotal: "95.00", factory: factory("b"), clientFactoryLink: null },
      ],
    });

    expect(getVisitScoreTotal(visit)).toBe(30);
  });

  it("cai no vínculo nas visitas antigas, sem foco", () => {
    const visit = item({
      clientFactoryLink: {
        id: "cfl-1",
        client: null,
        factory: factory("a"),
        latestVisitScore: score({ scoreTotal: "33.00" }),
      },
    });

    expect(getVisitScoreTotal(visit)).toBe(33);
  });

  // Último recurso: sem score atual em lugar nenhum, um número velho ainda diz
  // mais que um card sem faixa.
  it("usa o congelado quando nada tem score atual", () => {
    const visit = item({
      focusFactories: [
        { scoreTotal: "55.00", factory: factory("a"), clientFactoryLink: null },
      ],
    });

    expect(getVisitScoreTotal(visit)).toBe(55);
  });

  it("devolve null quando não há score em lugar nenhum", () => {
    expect(getVisitScoreTotal(item())).toBeNull();
    expect(
      getVisitScoreTotal(
        item({
          focusFactories: [
            {
              scoreTotal: null,
              factory: factory("a"),
              clientFactoryLink: null,
            },
          ],
        })
      )
    ).toBeNull();
  });
});

describe("getVisitScoreReasons", () => {
  const focus = (id: string, dims: ScoreDimensions) => ({
    scoreTotal: dims.scoreTotal,
    factory: factory(id),
    clientFactoryLink: { id: `cfl-${id}`, latestVisitScore: dims },
  });

  it("explica o score de cada empresa em foco, da mais urgente para a menos", () => {
    const visit = item({
      focusFactories: [
        focus("a", score({ scoreTotal: "30.00", scoreFrequency: "40" })),
        focus("b", score({ scoreTotal: "80.00", scoreUrgency: "100" })),
      ],
    });

    const reasons = getVisitScoreReasons(visit);

    expect(reasons.map((r) => r.factoryLabel)).toEqual([
      "Fábrica b",
      "Fábrica a",
    ]);
    expect(reasons[0].explanation.level.label).toBe("Urgente");
    expect(reasons[0].explanation.reasons[0].label).toBe("Urgência");
    expect(reasons[1].explanation.reasons[0].label).toBe("Frequência");
  });

  // O total do foco é congelado na geração da rotina; o MOTIVO tem de refletir
  // o score de hoje, senão o painel explica uma urgência já resolvida.
  it("usa as dimensões do score atual do vínculo, não o total congelado", () => {
    const visit = item({
      focusFactories: [
        {
          scoreTotal: "90.00",
          factory: factory("a"),
          clientFactoryLink: {
            id: "cfl-a",
            latestVisitScore: score({
              scoreTotal: "20.00",
              scorePriority: "50",
            }),
          },
        },
      ],
    });

    const [reason] = getVisitScoreReasons(visit);

    expect(reason.explanation.total).toBe(20);
    expect(reason.explanation.reasons.map((r) => r.label)).toEqual([
      "Prioridade",
    ]);
  });

  it("cai no vínculo principal nas visitas antigas, sem foco", () => {
    const visit = item({
      clientFactoryLink: {
        id: "cfl-1",
        client: null,
        factory: factory("a"),
        latestVisitScore: score({ scoreTotal: "33.00", scoreRecency: "20" }),
      },
    });

    const reasons = getVisitScoreReasons(visit);

    expect(reasons).toHaveLength(1);
    expect(reasons[0].factoryLabel).toBe("Fábrica a");
    expect(reasons[0].explanation.reasons[0].label).toBe("Recência");
  });

  it("sem score calculado não há motivo a exibir", () => {
    expect(getVisitScoreReasons(item())).toEqual([]);
    expect(
      getVisitScoreReasons(
        item({
          focusFactories: [
            {
              scoreTotal: "90.00",
              factory: factory("a"),
              clientFactoryLink: { id: "cfl-a", latestVisitScore: null },
            },
          ],
        })
      )
    ).toEqual([]);
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

describe("formatVisitSlot", () => {
  it("mostra a hora e a duração da visita", () => {
    expect(
      formatVisitSlot({ plannedStartTime: "09:40", visitDurationMin: 30 })
    ).toBe(" · 09:40 · 30 min");
  });

  it("sem duração, mostra só a hora", () => {
    expect(
      formatVisitSlot({ plannedStartTime: "09:40", visitDurationMin: null })
    ).toBe(" · 09:40");
  });

  it("contato remoto não tem horário de rota — nada é exibido", () => {
    expect(
      formatVisitSlot({ plannedStartTime: null, visitDurationMin: 30 })
    ).toBe("");
  });
});

describe("formatTravelToStop", () => {
  it("diz que o número é deslocamento, com todas as letras", () => {
    // O bug que motivou o helper: "· 7m" solto era lido como visita de 7 min.
    expect(formatTravelToStop(7)).toBe("7 min até aqui");
  });

  it("primeira parada do dia (ou sem trajeto) não vira linha vazia", () => {
    expect(formatTravelToStop(0)).toBeNull();
    expect(formatTravelToStop(null)).toBeNull();
  });
});
