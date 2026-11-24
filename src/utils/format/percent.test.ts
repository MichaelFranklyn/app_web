import { describe, expect, it } from "vitest";

import { formatPercent, formatPercentPoints } from "./percent";

describe("formatPercent", () => {
  it("converte a fração em porcentagem inteira, arredondando", () => {
    expect(formatPercent(0)).toBe("0%");
    expect(formatPercent(0.476)).toBe("48%");
    expect(formatPercent(1)).toBe("100%");
  });

  it("usa vírgula nas casas decimais", () => {
    expect(formatPercent(0.125, 1)).toBe("12,5%");
  });

  it("não escreve -0%", () => {
    expect(formatPercent(-0.004)).toBe("0%");
  });
});

describe("formatPercentPoints", () => {
  it("formata o valor que já está em pontos", () => {
    expect(formatPercentPoints(47.6)).toBe("48%");
    expect(formatPercentPoints(7.25, 2)).toBe("7,25%");
    expect(formatPercentPoints(1234)).toBe("1.234%");
  });

  it("com trimZeros, as casas viram teto", () => {
    expect(formatPercentPoints(7.5, 2, { trimZeros: true })).toBe("7,5%");
    expect(formatPercentPoints(12, 2, { trimZeros: true })).toBe("12%");
  });
});
