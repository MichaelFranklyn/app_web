import { describe, expect, it } from "vitest";

import { TripPlan, TripRegionOption } from "./interface";
import {
  buildPlanInput,
  leftOutCount,
  plannedVisitCount,
  regionOptionLabel,
} from "./utils";

const option = (key: string, city: string, count = 3): TripRegionOption => ({
  key,
  city,
  state: "BA",
  clientCount: count,
  locatedCount: count,
});

const options = [
  option("feira|BA", "Feira de Santana"),
  option("ser|BA", "Serrinha", 1),
];

describe("regionOptionLabel", () => {
  it("diz a cidade, a UF e quantos clientes", () => {
    expect(regionOptionLabel(options[0])).toBe(
      "Feira de Santana - BA · 3 clientes"
    );
    expect(regionOptionLabel(options[1])).toBe("Serrinha - BA · 1 cliente");
  });
});

describe("buildPlanInput", () => {
  const period = { from: new Date(2026, 9, 5), to: new Date(2026, 9, 7) };

  it("monta as cidades escolhidas e o período em ISO", () => {
    expect(
      buildPlanInput("s1", ["ser|BA"], options, period, "  feira ", true)
    ).toEqual({
      sellerId: "s1",
      cities: [{ city: "Serrinha", state: "BA" }],
      startDate: "2026-10-05",
      endDate: "2026-10-07",
      note: "feira",
      dryRun: true,
    });
  });

  it("um dia só: a volta é o próprio dia da ida", () => {
    const input = buildPlanInput(
      "s1",
      ["feira|BA"],
      options,
      { from: period.from, to: null },
      "",
      false
    );
    expect(input?.endDate).toBe("2026-10-05");
    expect(input?.note).toBeNull();
  });

  it("sem cidade ou sem data não há o que pedir", () => {
    expect(buildPlanInput("s1", [], options, period, "", true)).toBeNull();
    expect(
      buildPlanInput(
        "s1",
        ["feira|BA"],
        options,
        { from: null, to: null },
        "",
        true
      )
    ).toBeNull();
  });
});

describe("contagens do plano", () => {
  const visit = {
    clientId: "c",
    clientName: "Loja",
    city: "Feira - BA",
    score: 50,
  };
  const plan: TripPlan = {
    trip: null,
    days: [
      { date: "2026-10-05", city: "Feira - BA", visits: [visit, visit] },
      { date: "2026-10-06", city: "Feira - BA", visits: [visit] },
    ],
    leftOut: [visit],
    ungeocoded: [visit, visit],
    alreadyScheduled: [],
    manualConflicts: 0,
    skippedDates: [],
    regionClientCount: 9,
    unavailableCount: 1,
  };

  it("soma as visitas dos dias e os que ficaram de fora", () => {
    expect(plannedVisitCount(plan)).toBe(3);
    expect(leftOutCount(plan)).toBe(4);
  });
});

describe("tripDayLabel", () => {
  it("dia da semana e data curta", async () => {
    const { tripDayLabel } = await import("./utils");
    expect(tripDayLabel("2026-10-05")).toBe("Seg, 05/10");
    expect(tripDayLabel("2026-10-10")).toBe("Sáb, 10/10");
  });
});
