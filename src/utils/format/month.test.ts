import { describe, expect, it } from "vitest";

import { addMonths, isBeforeMonth, isInMonth, monthEndIso } from "./month";

describe("isBeforeMonth", () => {
  it("compara na ordem do calendário, e não campo a campo", () => {
    // O caso que um `a.month < b.month` ingênuo erra: dezembro vem ANTES de
    // janeiro do ano seguinte, embora 12 seja maior que 1.
    expect(
      isBeforeMonth({ year: 2026, month: 12 }, { year: 2027, month: 1 })
    ).toBe(true);
    expect(
      isBeforeMonth({ year: 2027, month: 1 }, { year: 2026, month: 12 })
    ).toBe(false);
  });

  it("o mesmo mês não é anterior a si", () => {
    expect(
      isBeforeMonth({ year: 2026, month: 9 }, { year: 2026, month: 9 })
    ).toBe(false);
  });
});

describe("addMonths", () => {
  it("vira o ano nas duas direções", () => {
    expect(addMonths({ year: 2026, month: 12 }, 1)).toEqual({
      year: 2027,
      month: 1,
    });
    expect(addMonths({ year: 2026, month: 1 }, -1)).toEqual({
      year: 2025,
      month: 12,
    });
  });
});

describe("isInMonth", () => {
  it("data nula não cai em mês nenhum", () => {
    expect(isInMonth(null, { year: 2026, month: 9 })).toBe(false);
  });
});

describe("monthEndIso", () => {
  it("fevereiro de ano bissexto termina no dia 29", () => {
    expect(monthEndIso({ year: 2028, month: 2 })).toBe("2028-02-29");
  });
});
