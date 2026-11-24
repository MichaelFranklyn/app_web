import { describe, expect, it } from "vitest";
import { ActivitySummary } from "../interface";
import { errorRate, isSlow } from "./utils";

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
