import { describe, expect, it } from "vitest";

import { formatDays, getLast12MonthsRangeIso, monthKeyToLabel } from "./utils";

describe("monthKeyToLabel", () => {
  it('converte "YYYY-MM" em "mes/aa"', () => {
    expect(monthKeyToLabel("2026-07")).toBe("jul/26");
    expect(monthKeyToLabel("2025-01")).toBe("jan/25");
    expect(monthKeyToLabel("2024-12")).toBe("dez/24");
  });

  it("devolve a chave crua para mês fora de 1..12", () => {
    expect(monthKeyToLabel("2026-13")).toBe("2026-13");
    expect(monthKeyToLabel("2026-00")).toBe("2026-00");
  });
});

describe("formatDays", () => {
  it("usa singular para 1 dia e plural para o resto", () => {
    expect(formatDays(1)).toBe("1 dia");
    expect(formatDays(18)).toBe("18 dias");
    expect(formatDays(0)).toBe("0 dias");
  });

  it("arredonda para o inteiro mais próximo", () => {
    expect(formatDays(18.666)).toBe("19 dias");
    expect(formatDays(1.2)).toBe("1 dia");
    expect(formatDays(2.5)).toBe("3 dias");
  });
});

describe("getLast12MonthsRangeIso", () => {
  it("cobre 12 meses: início do mês 11 meses atrás → hoje", () => {
    const { from, to } = getLast12MonthsRangeIso();

    // `from` é sempre o primeiro dia de um mês
    expect(from).toMatch(/^\d{4}-\d{2}-01$/);
    expect(to).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(from <= to).toBe(true);

    // Distância de 11 meses entre from e to (mesmo dia-do-mês ou anterior)
    const [fy, fm] = from.split("-").map(Number);
    const [ty, tm] = to.split("-").map(Number);
    const monthsSpan = (ty - fy) * 12 + (tm - fm);
    expect(monthsSpan).toBe(11);
  });
});
