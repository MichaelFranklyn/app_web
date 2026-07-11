import { describe, expect, it } from "vitest";

import { PreviewItem } from "../interface";
import {
  buildPriceOptions,
  buildSpreadsheetPreview,
  ColumnMapping,
  fileTypeOf,
} from "./templateBuilders";

const col = (index: number) => ({ kind: "column" as const, index });

describe("buildSpreadsheetPreview", () => {
  const mapping: ColumnMapping = {
    sku: col(0),
    quantity: col(1),
    unitPrice: col(2),
  };

  it("mapeia linhas válidas e converte números BR", () => {
    const sheet = { rows: [["ABC", "10", "12,50"]] };
    expect(buildSpreadsheetPreview(sheet, mapping)).toEqual([
      { sku: "ABC", name: null, quantity: "10", unitPrice: "12.5" },
    ]);
  });

  it("descarta linha sem SKU ou com quantidade <= 0", () => {
    const sheet = {
      rows: [
        ["", "10", "5"],
        ["ABC", "0", "5"],
      ],
    };
    expect(buildSpreadsheetPreview(sheet, mapping)).toEqual([]);
  });

  it("deixa unitPrice nulo quando a coluna de preço não é mapeada", () => {
    const sheet = { rows: [["ABC", "3", "9,99"]] };
    const semPreco: ColumnMapping = { ...mapping, unitPrice: { kind: "none" } };
    expect(buildSpreadsheetPreview(sheet, semPreco)[0].unitPrice).toBeNull();
  });

  it("retorna vazio quando não há planilha", () => {
    expect(buildSpreadsheetPreview(null, mapping)).toEqual([]);
  });
});

describe("fileTypeOf", () => {
  it("classifica por extensão", () => {
    expect(fileTypeOf("pedido.pdf")).toBe("PDF");
    expect(fileTypeOf("tabela.csv")).toBe("CSV");
    expect(fileTypeOf("tabela.xlsx")).toBe("XLSX");
    expect(fileTypeOf("tabela.xls")).toBe("XLSX");
  });
});

describe("buildPriceOptions", () => {
  it("usa a primeira amostra com valores e acrescenta 'sem preço'", () => {
    const preview: PreviewItem[] = [
      { sku: "A", name: null, quantity: "1", unitPrice: null },
      {
        sku: "B",
        name: null,
        quantity: "1",
        unitPrice: null,
        priceOptions: ["10,00", "12,00"],
      },
    ];
    expect(buildPriceOptions(preview)).toEqual([
      { value: "0", label: "10,00" },
      { value: "1", label: "12,00" },
      { value: "none", label: "Sem preço (usar a tabela da fábrica)" },
    ]);
  });

  it("retorna vazio quando nenhuma linha traz valores", () => {
    expect(buildPriceOptions(null)).toEqual([]);
    expect(
      buildPriceOptions([
        { sku: "A", name: null, quantity: "1", unitPrice: null },
      ])
    ).toEqual([]);
  });
});
