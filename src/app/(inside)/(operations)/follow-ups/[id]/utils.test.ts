import { describe, expect, it } from "vitest";

import {
  addDaysIso,
  hasCancelReason,
  isSchedulable,
  quickDates,
  weekdayName,
} from "./utils";

describe("datas do contato", () => {
  it("soma dias atravessando mês e ano sem escorregar de fuso", () => {
    expect(addDaysIso("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDaysIso("2026-12-25", 7)).toBe("2027-01-01");
  });

  it("atalhos contam de hoje", () => {
    expect(quickDates("2026-10-11").map((q) => q.value)).toEqual([
      "2026-10-12",
      "2026-10-18",
      "2026-10-26",
      "2026-11-10",
    ]);
  });

  it("diz o dia da semana por extenso", () => {
    expect(weekdayName("2026-10-12")).toBe("segunda-feira");
  });

  it("hoje vale; ontem e vazio não", () => {
    expect(isSchedulable("2026-10-11", "2026-10-11")).toBe(true);
    expect(isSchedulable("2026-10-10", "2026-10-11")).toBe(false);
    expect(isSchedulable("", "2026-10-11")).toBe(false);
  });
});

describe("motivo do cancelamento", () => {
  it("texto de verdade vale, com ou sem espaço em volta", () => {
    expect(hasCancelReason("Fechou com outro fornecedor")).toBe(true);
    expect(hasCancelReason("  ok  ")).toBe(true);
  });

  it("vazio e só espaço não são motivo", () => {
    expect(hasCancelReason("")).toBe(false);
    expect(hasCancelReason("   ")).toBe(false);
    expect(hasCancelReason("\n\t ")).toBe(false);
  });
});
