import { describe, expect, it } from "vitest";

import { VisitScheduleDay, VisitScheduleItem } from "../interface";
import { buildWeekContext, buildWeekSections } from "./index";

/**
 * A folha da semana é COMPOSIÇÃO: cabeçalho, tabela e rodapé têm testes
 * próprios (utils/pdf) e as colunas têm os seus. O que se prende aqui é o
 * RECORTE — quais dias entram, o que cada um leva e o que o topo declara.
 */

const stop = (over: Partial<VisitScheduleItem> = {}): VisitScheduleItem =>
  ({
    id: "it-1",
    fixedScheduleId: null,
    plannedOrder: 1,
    contactType: "IN_PERSON",
    estimatedTravelMin: null,
    plannedStartTime: "09:40",
    plannedEndTime: "10:10",
    visitDurationMin: 30,
    status: "PENDING",
    isWholeDay: false,
    isManual: false,
    outcome: null,
    notes: null,
    focusFactories: [],
    treatedFactories: [],
    clientFactoryLink: null,
    ...over,
  }) as VisitScheduleItem;

const day = (
  date: string,
  items: VisitScheduleItem[],
  over: Partial<VisitScheduleDay> = {}
): VisitScheduleDay =>
  ({
    id: `d-${date}`,
    date,
    status: "PLANNED",
    departureType: "HOME",
    routeDistanceKm: "0",
    routeDurationMin: 0,
    items,
    ...over,
  }) as VisitScheduleDay;

// Semana de 21/09/2026 (segunda) a 27/09/2026 (domingo).
const WEEK_START = "2026-09-21";

describe("buildWeekSections", () => {
  it("entrega os sete dias, inclusive os que não têm rotina", () => {
    // O buraco na agenda é justamente o que o gestor procura no papel: um dia
    // que some da folha some também da conferência.
    const sections = buildWeekSections(WEEK_START, [
      day("2026-09-22", [stop()]),
    ]);

    expect(sections).toHaveLength(7);
    expect(sections.map((s) => s.date)).toEqual([
      "2026-09-21",
      "2026-09-22",
      "2026-09-23",
      "2026-09-24",
      "2026-09-25",
      "2026-09-26",
      "2026-09-27",
    ]);
    expect(sections[1].stops).toHaveLength(1);
    expect(sections[0].stops).toHaveLength(0);
  });

  it("separa ligação de visita presencial", () => {
    const sections = buildWeekSections(WEEK_START, [
      day("2026-09-21", [
        stop({ id: "a" }),
        stop({ id: "b", contactType: "REMOTE" }),
      ]),
    ]);

    expect(sections[0].stops.map((s) => s.id)).toEqual(["a"]);
    expect(sections[0].remoteStops.map((s) => s.id)).toEqual(["b"]);
  });

  it("marca folga tanto pelo dia marcado quanto pelo status OFF", () => {
    const sections = buildWeekSections(
      WEEK_START,
      [day("2026-09-23", [], { status: "OFF" })],
      ["2026-09-21"]
    );

    expect(sections[0].isDayOff).toBe(true);
    expect(sections[2].isDayOff).toBe(true);
    expect(sections[1].isDayOff).toBe(false);
  });

  it("dia sem rotina não inventa quilometragem", () => {
    const sections = buildWeekSections(WEEK_START, []);

    expect(sections[0].routeDistanceKm).toBe("0");
    expect(sections[0].routeDurationMin).toBe(0);
  });
});

describe("buildWeekContext", () => {
  it("declara de quem é a semana e o que ela custa", () => {
    const sections = buildWeekSections(WEEK_START, [
      day("2026-09-21", [stop()], {
        routeDistanceKm: "40.0",
        routeDurationMin: 60,
      }),
      day("2026-09-22", [stop({ contactType: "REMOTE" })], {
        routeDistanceKm: "20.0",
        routeDurationMin: 30,
      }),
    ]);

    const context = buildWeekContext(sections, "Ana");

    expect(context[0]).toBe("Vendedor: Ana");
    expect(context).toContain("1 visita(s)");
    expect(context).toContain("1 ligação(ões)");
    expect(context).toContain("2 dia(s) com agenda");
    // Os quilômetros somam a semana inteira, não o maior dia.
    expect(context).toContain("60,0 km");
  });

  it("semana sem ligação não anuncia ligação", () => {
    const sections = buildWeekSections(WEEK_START, [
      day("2026-09-21", [stop()]),
    ]);

    expect(buildWeekContext(sections, null).join(" ")).not.toContain("ligação");
  });

  it("sem vendedor escolhido o topo não abre a linha", () => {
    // O gestor pode imprimir sem seletor de vendedor; inventar um nome ali
    // faria a folha declarar um recorte que ela não tem.
    const sections = buildWeekSections(WEEK_START, []);

    expect(buildWeekContext(sections, null)[0]).toBe("0 visita(s)");
  });
});
