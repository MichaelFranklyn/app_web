import { describe, expect, it } from "vitest";

import {
  importBatchFilters,
  joinScopeLabel,
  parseImportBatch,
} from "./useOrdersTab";

const ID = "33333333-3333-4333-8333-333333333333";

describe("lote de importação na lista de pedidos", () => {
  it("só um id válido vira filtro", () => {
    expect(parseImportBatch(ID)).toBe(ID);
    expect(parseImportBatch("lixo")).toBeNull();
    expect(parseImportBatch(null)).toBeNull();
    expect(importBatchFilters(null)).toEqual([]);
    expect(importBatchFilters(ID)).toEqual([
      { field: "import_batch_id", value: ID, operator: "eq" },
    ]);
  });

  it("o recorte do lote soma ao da aba no texto", () => {
    expect(joinScopeLabel(null, null)).toBeNull();
    expect(joinScopeLabel("Somente: esperando entrega", null)).toBe(
      "Somente: esperando entrega"
    );
    expect(joinScopeLabel(null, ID)).toBe("Somente: pedidos de uma importação");
    expect(joinScopeLabel("Somente: esperando entrega", ID)).toBe(
      "Somente: esperando entrega · pedidos de uma importação"
    );
    expect(joinScopeLabel(null, ID, "17/11/2026")).toBe(
      "Somente: pedidos da importação de 17/11/2026"
    );
    expect(joinScopeLabel("Somente: esperando entrega", ID, "17/11/2026")).toBe(
      "Somente: esperando entrega · pedidos da importação de 17/11/2026"
    );
  });
});
