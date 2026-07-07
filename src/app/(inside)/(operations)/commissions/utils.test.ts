import { describe, expect, it } from "vitest";
import { addMonths, isInMonth, yearMonthFromIso } from "./utils";

describe("yearMonthFromIso", () => {
  it("extrai ano e mês de uma data ISO", () => {
    expect(yearMonthFromIso("2026-03-15")).toEqual({ year: 2026, month: 3 });
  });
});

describe("addMonths", () => {
  it("navega meses normalizando a virada de ano", () => {
    expect(addMonths({ year: 2026, month: 1 }, -1)).toEqual({
      year: 2025,
      month: 12,
    });
    expect(addMonths({ year: 2026, month: 12 }, 1)).toEqual({
      year: 2027,
      month: 1,
    });
  });
});

describe("isInMonth", () => {
  it("verdadeiro só quando a data ISO cai no mês/ano informado", () => {
    const ym = { year: 2026, month: 3 };
    expect(isInMonth("2026-03-10", ym)).toBe(true);
    expect(isInMonth("2026-04-01", ym)).toBe(false);
    expect(isInMonth(null, ym)).toBe(false);
  });
});
