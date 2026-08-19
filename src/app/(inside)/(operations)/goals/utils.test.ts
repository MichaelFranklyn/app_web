import { describe, expect, it } from "vitest";

import { GoalRow } from "./interface";
import {
  copySourceMonths,
  groupBySeller,
  metricValues,
  overallPercent,
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

describe("overallPercent", () => {
  const totals = (
    over: Partial<Record<string, { target: number | null; done: number }>> = {}
  ) => ({
    invoiced: { target: 100, done: 50 },
    ordered: { target: 100, done: 100 },
    positivations: { target: 10, done: 5 },
    visits: { target: 10, done: 5 },
    ...over,
  });

  it("é a média dos indicadores, não só o faturamento", () => {
    // 50 + 100 + 50 + 50 = 250 / 4. Quem bateu a venda mas não visitou ninguém
    // não cumpriu o mês, e um número só esconderia isso.
    expect(overallPercent(totals())).toBeCloseTo(62.5);
  });

  it("indicador sem meta fica de fora da média", () => {
    // Só faturamento (50%) e vendas (100%) foram combinados.
    const percent = overallPercent(
      totals({
        positivations: { target: null, done: 5 },
        visits: { target: null, done: 5 },
      })
    );
    expect(percent).toBeCloseTo(75);
  });

  it("nada combinado devolve nulo — a tela diz 'sem meta', não '0%'", () => {
    const percent = overallPercent(
      totals({
        invoiced: { target: null, done: 900 },
        ordered: { target: null, done: 900 },
        positivations: { target: null, done: 9 },
        visits: { target: null, done: 9 },
      })
    );
    expect(percent).toBeNull();
  });

  it("passa de 100% quando o vendedor supera o combinado", () => {
    const percent = overallPercent(
      totals({
        invoiced: { target: 100, done: 200 },
        ordered: { target: 100, done: 200 },
        positivations: { target: 10, done: 20 },
        visits: { target: 10, done: 20 },
      })
    );
    expect(percent).toBe(200);
  });
});

describe("copySourceMonths", () => {
  it("lista os meses já decorridos do ano, do mais recente ao mais antigo", () => {
    // Em agosto, a grade pode vir de janeiro a julho — não de setembro, que
    // ainda não aconteceu.
    expect(copySourceMonths({ year: 2026, month: 8 })).toEqual([
      { year: 2026, month: 7 },
      { year: 2026, month: 6 },
      { year: 2026, month: 5 },
      { year: 2026, month: 4 },
      { year: 2026, month: 3 },
      { year: 2026, month: 2 },
      { year: 2026, month: 1 },
    ]);
  });

  it("em fevereiro sobra só janeiro", () => {
    expect(copySourceMonths({ year: 2026, month: 2 })).toEqual([
      { year: 2026, month: 1 },
    ]);
  });

  it("em janeiro oferece o ano anterior inteiro, de dezembro para trás", () => {
    // A virada do ano é justamente quando repetir a grade mais importa.
    const meses = copySourceMonths({ year: 2026, month: 1 });
    expect(meses).toHaveLength(12);
    expect(meses[0]).toEqual({ year: 2025, month: 12 });
    expect(meses[11]).toEqual({ year: 2025, month: 1 });
  });

  it("nunca oferece o próprio mês", () => {
    for (const month of [1, 5, 12]) {
      const meses = copySourceMonths({ year: 2026, month });
      expect(meses).not.toContainEqual({ year: 2026, month });
    }
  });
});
