import { describe, expect, it } from "vitest";

import { Cadence, cadenceDaysLabel, cadenceSourceLabel } from "./cadence";

const cadence = (over: Partial<Cadence> = {}): Cadence => ({
  days: 30,
  source: "observada",
  isDivergent: false,
  declaredDays: null,
  observedDays: 30,
  nextOrderDue: null,
  nextVisitEstimate: null,
  divergenceMessage: null,
  ...over,
});

describe("cadenceDaysLabel", () => {
  it("mostra o ciclo que vale", () => {
    expect(cadenceDaysLabel(cadence({ days: 45 }))).toBe("45 dias");
  });

  it("sem cadência não inventa número", () => {
    expect(cadenceDaysLabel(cadence({ days: null }))).toBe("—");
    expect(cadenceDaysLabel(null)).toBe("—");
  });

  it("não reintroduz a precedência antiga do cadastro", () => {
    // A tela mostrava visitFrequencyDays e, na falta dele, orderIntervalDays —
    // reproduzindo no front a regra que o backend abandonou em 2026-08-04.
    // Aqui existe UMA fonte: o `days` já arbitrado. Um cliente cujo cadastro diz
    // 30 e cujos pedidos dizem 45 tem de ler 45 na tela.
    expect(cadenceDaysLabel(cadence({ days: 45, declaredDays: 30 }))).toBe(
      "45 dias"
    );
  });
});

describe("cadenceSourceLabel", () => {
  it("nomeia a procedência de cada fonte", () => {
    expect(cadenceSourceLabel("observada")).toBe("pelos pedidos");
    expect(cadenceSourceLabel("declarada")).toBe("estimado por você");
    expect(cadenceSourceLabel("combinada")).toBe("combinado no cadastro");
  });

  it("sem fonte não rotula nada", () => {
    expect(cadenceSourceLabel("desconhecida")).toBe("");
  });
});
