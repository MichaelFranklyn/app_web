import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";

import {
  guessBestSheet,
  guessHeaderRow,
  readSpreadsheet,
  readWorkbook,
  splitAt,
} from "./reader";

// jsdom não implementa File.text()/File.arrayBuffer() — readWorkbook só usa
// name/type/text/arrayBuffer, então um stub leve basta.
const csvFile = (content: string): File =>
  ({
    name: "x.csv",
    type: "text/csv",
    text: async () => content,
  }) as unknown as File;

describe("readWorkbook", () => {
  it("lê CSV como aba única, descartando linhas vazias", async () => {
    const wb = await readWorkbook(csvFile("a,b\n\n1,2\n"));
    expect(wb.sheetNames).toEqual(["CSV"]);
    expect(wb.sheets.CSV).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("lê Excel com todas as abas (import dinâmico do SheetJS)", async () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["SKU", "Qtd"],
      ["A", 1],
    ]);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, ws, "Precos");
    const buf: Uint8Array = XLSX.write(book, {
      type: "array",
      bookType: "xlsx",
    });
    const file = {
      name: "tabela.xlsx",
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      arrayBuffer: async () => buf,
    } as unknown as File;

    const wb = await readWorkbook(file);
    expect(wb.sheetNames).toContain("Precos");
    expect(wb.sheets.Precos[0]).toEqual(["SKU", "Qtd"]);
  });
});

describe("readSpreadsheet", () => {
  it("devolve a matriz da primeira aba (CSV)", async () => {
    expect(await readSpreadsheet(csvFile("x,y\n1,2"))).toEqual([
      ["x", "y"],
      ["1", "2"],
    ]);
  });
});

describe("guessBestSheet", () => {
  it("escolhe a aba com mais linhas", () => {
    const wb = {
      sheetNames: ["form", "precos"],
      sheets: { form: [["a"]], precos: [["a"], ["b"], ["c"]] },
    };
    expect(guessBestSheet(wb)).toBe("precos");
  });

  it("retorna null sem abas", () => {
    expect(guessBestSheet({ sheetNames: [], sheets: {} })).toBeNull();
  });
});

describe("guessHeaderRow", () => {
  it("escolhe a linha com mais células preenchidas entre as primeiras", () => {
    const matrix = [
      ["Tabela de Preços", "", ""],
      ["", "", ""],
      ["SKU", "Nome", "Preço"],
      ["1", "Cimento", "10"],
    ];
    expect(guessHeaderRow(matrix)).toBe(2);
  });
});

describe("splitAt", () => {
  it("separa cabeçalho (limpo) das linhas de dados", () => {
    const matrix = [
      ["lixo"],
      ["  SKU ", "Nome\tProduto"],
      ["1", "Cimento"],
      ["", ""],
      ["2", "Areia"],
    ];
    const { headers, rows } = splitAt(matrix, 1);
    expect(headers).toEqual(["SKU", "Nome Produto"]);
    expect(rows).toEqual([
      ["1", "Cimento"],
      ["2", "Areia"],
    ]);
  });
});
