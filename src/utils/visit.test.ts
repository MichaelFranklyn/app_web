import { describe, expect, it } from "vitest";

import {
  STOCK_OBSERVATION_OPTIONS,
  VISIT_OUTCOME_OPTIONS,
  VISIT_STATUS_COLOR,
  VISIT_STATUS_LABEL,
  VISIT_STATUS_OPTIONS,
} from "./visit";

describe("catálogos de visita", () => {
  it("label e cor cobrem os mesmos status", () => {
    expect(Object.keys(VISIT_STATUS_LABEL).sort()).toEqual(
      Object.keys(VISIT_STATUS_COLOR).sort()
    );
    expect(VISIT_STATUS_LABEL.COMPLETED).toBe("Realizada");
    expect(VISIT_STATUS_COLOR.COMPLETED).toBe("green");
  });

  it("as options derivam do mapa de label", () => {
    expect(VISIT_STATUS_OPTIONS).toContainEqual({
      value: "PENDING",
      label: "Pendente",
    });
    expect(VISIT_STATUS_OPTIONS).toHaveLength(
      Object.keys(VISIT_STATUS_LABEL).length
    );
  });

  it("outcome/estoque expõem os valores esperados", () => {
    expect(VISIT_OUTCOME_OPTIONS.map((o) => o.value)).toContain("SOLD");
    expect(STOCK_OBSERVATION_OPTIONS.map((o) => o.value)).toContain(
      "OUT_OF_STOCK"
    );
  });
});
