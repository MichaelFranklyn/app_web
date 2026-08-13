import { describe, expect, it } from "vitest";
import { ActivitySummary } from "../interface";
import { errorRate, formatDuration, isSlow } from "./utils";

describe("errorRate", () => {
  const summary = (partial: Partial<ActivitySummary>): ActivitySummary => ({
    totalActions: 100,
    totalErrors: 5,
    byOperation: [],
    byDay: [],
    ...partial,
  });

  it("fatia das ações que falhou", () => {
    expect(errorRate(summary({}))).toBe(5);
  });

  it("sem nenhuma ação devolve zero em vez de NaN", () => {
    expect(errorRate(summary({ totalActions: 0, totalErrors: 0 }))).toBe(0);
  });
});

describe("formatDuration", () => {
  it("abaixo de um segundo fica em ms", () => {
    expect(formatDuration(240)).toBe("240ms");
  });

  it("a partir de um segundo vira segundos", () => {
    expect(formatDuration(2400)).toBe("2.4s");
  });

  it("exatamente 1000ms já é 1.0s", () => {
    expect(formatDuration(1000)).toBe("1.0s");
  });

  it("sem medição é travessão, não zero", () => {
    expect(formatDuration(null)).toBe("—");
  });
});

describe("isSlow", () => {
  it("rápido não é lento", () => {
    expect(isSlow(999)).toBe(false);
  });

  it("a partir de um segundo é lento", () => {
    expect(isSlow(1000)).toBe(true);
  });

  it("sem medição não é lento", () => {
    // Ausência de dado não é evidência de problema.
    expect(isSlow(null)).toBe(false);
  });
});
