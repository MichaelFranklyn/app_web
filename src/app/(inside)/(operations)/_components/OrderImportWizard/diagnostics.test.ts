import { describe, expect, it } from "vitest";

import { buildImportSource } from "./diagnostics";
import { Mapping } from "./interface";

const mapping = (sku: number): Mapping => ({
  sku: { kind: "column", index: sku },
  quantity: { kind: "column", index: 2 },
  unitPrice: { kind: "none" },
  ipiRate: { kind: "none" },
});

const base = {
  fileName: "PEDIDO.xlsx",
  fileRef: "uploads/e/1.xlsx",
  sheetNames: ["PEDIDO", "Base"],
  sheet: "PEDIDO",
  headerIndex: 12,
  headers: ["Código", "Descrição", "Qtde"],
  mapping: mapping(1),
  matrix: Array.from({ length: 100 }, (_, i) => [`linha ${i}`]),
  rowsRead: 62,
};

describe("buildImportSource", () => {
  it("planilha: leva o que foi sugerido ao lado do que a pessoa escolheu", () => {
    const source = buildImportSource({
      ...base,
      kind: "sheet",
      guess: { sheet: "Base", headerIndex: 0, mapping: mapping(0) },
    });

    expect(source.reading).toMatchObject({
      kind: "sheet",
      sheet: "PEDIDO",
      guessedSheet: "Base",
      headerIndex: 12,
      guessedHeaderIndex: 0,
      mapping: mapping(1),
      guessedMapping: mapping(0),
    });
  });

  // A grade inteira não viaja: o diagnóstico precisa de uma amostra.
  it("manda só as primeiras linhas da grade", () => {
    const source = buildImportSource({ ...base, kind: "grid", guess: null });

    expect(
      "sampleRows" in source.reading && source.reading.sampleRows
    ).toHaveLength(40);
  });

  // Formato conhecido leu sozinho: não há sugestão para comparar.
  it("itens prontos: só identifica o arquivo", () => {
    const source = buildImportSource({ ...base, kind: "items", guess: null });

    expect(source).toEqual({
      fileName: "PEDIDO.xlsx",
      fileRef: "uploads/e/1.xlsx",
      reading: { kind: "items", rowsRead: 62 },
    });
  });
});
