import { describe, expect, it } from "vitest";

import { GoalRow } from "./interface";
import {
  groupBySeller,
  metricValues,
  percentOf,
  percentTone,
  sumRows,
} from "./utils";

const row = (overrides: Partial<GoalRow> = {}): GoalRow => ({
  goalId: "g1",
  sellerId: "s1",
  factoryId: "f1",
  periodMonth: "2026-08-01",
  seller: { id: "s1", name: "Rafael" },
  factory: {
    id: "f1",
    nomeFantasia: "Delta",
    nickname: null,
    razaoSocial: "Delta LTDA",
  },
  targetInvoicedAmount: "80000",
  targetOrderedAmount: null,
  targetPositivations: 20,
  targetVisits: 40,
  invoicedAmount: "60000",
  orderedAmount: "72000",
  positivations: 14,
  visits: 31,
  ...overrides,
});

describe("metricValues", () => {
  it("lê meta e realizado de cada indicador", () => {
    expect(metricValues(row(), "invoiced")).toEqual({
      target: 80000,
      done: 60000,
    });
    expect(metricValues(row(), "visits")).toEqual({ target: 40, done: 31 });
  });

  it("indicador sem meta devolve alvo nulo, não zero", () => {
    expect(metricValues(row(), "ordered")).toEqual({
      target: null,
      done: 72000,
    });
  });
});

describe("percentOf", () => {
  it("calcula o quanto da meta foi cumprido", () => {
    expect(percentOf({ target: 80000, done: 60000 })).toBe(75);
  });

  it("sem meta não há percentual — barra vazia leria como atraso", () => {
    expect(percentOf({ target: null, done: 72000 })).toBeNull();
  });

  it("meta zero com realizado conta como batida", () => {
    expect(percentOf({ target: 0, done: 10 })).toBe(100);
    expect(percentOf({ target: 0, done: 0 })).toBe(0);
  });
});

describe("percentTone", () => {
  it("verde a partir da meta batida", () => {
    expect(percentTone(100)).toBe("green");
    expect(percentTone(140)).toBe("green");
  });

  it("vermelho quando está longe", () => {
    expect(percentTone(35)).toBe("red");
  });

  it("âmbar no meio do caminho e quando não há meta", () => {
    expect(percentTone(80)).toBe("amber");
    expect(percentTone(null)).toBe("amber");
  });
});

describe("sumRows", () => {
  it("soma o realizado de todas as linhas", () => {
    const totals = sumRows([row(), row({ factoryId: "f2", visits: 9 })]);
    expect(totals.visits.done).toBe(40);
  });

  it("fábrica sem meta não entra na meta total", () => {
    const totals = sumRows([
      row(),
      row({
        factoryId: "f2",
        targetInvoicedAmount: null,
        invoicedAmount: "5000",
      }),
    ]);
    expect(totals.invoiced.target).toBe(80000);
    expect(totals.invoiced.done).toBe(65000);
  });

  it("nenhuma linha com meta mantém o total sem meta", () => {
    const totals = sumRows([row({ targetVisits: null })]);
    expect(totals.visits.target).toBeNull();
  });
});

describe("groupBySeller", () => {
  it("agrupa por vendedor em ordem alfabética", () => {
    const groups = groupBySeller([
      row({ sellerId: "s2", seller: { id: "s2", name: "Zeca" } }),
      row(),
      row({ factoryId: "f2" }),
    ]);
    expect(groups.map((g) => g.sellerName)).toEqual(["Rafael", "Zeca"]);
    expect(groups[0].rows).toHaveLength(2);
  });
});
