import { describe, expect, it } from "vitest";

import {
  formatInstallments,
  installmentsCountLabel,
  parseInstallments,
} from "./utils";

describe("parseInstallments", () => {
  it("aceita o prazo do jeito que a pessoa digita", () => {
    expect(parseInstallments("30/60/90")).toEqual([30, 60, 90]);
    expect(parseInstallments("30, 60, 90")).toEqual([30, 60, 90]);
    expect(parseInstallments("30 60 90 dias")).toEqual([30, 60, 90]);
  });

  it("ordena e tira repetido — a mesma data duas vezes não é parcela", () => {
    expect(parseInstallments("60/30/60")).toEqual([30, 60]);
  });

  it("texto sem número nenhum não vira parcela", () => {
    expect(parseInstallments("à vista")).toEqual([]);
    expect(parseInstallments("")).toEqual([]);
  });

  it("zero é prazo válido: é a venda à vista", () => {
    expect(parseInstallments("0")).toEqual([0]);
  });
});

describe("rótulos do prazo", () => {
  it("mostra os dias como foram acordados", () => {
    expect(formatInstallments([30, 60, 90])).toBe("30/60/90");
  });

  it("prazo zero se chama à vista, não '0'", () => {
    expect(formatInstallments([0])).toBe("À vista");
  });

  it("sem parcela, não promete nada", () => {
    expect(formatInstallments([])).toBe("—");
  });

  it("conta as parcelas no singular e no plural", () => {
    expect(installmentsCountLabel([30])).toBe("1 parcela");
    expect(installmentsCountLabel([30, 60])).toBe("2 parcelas");
  });
});
