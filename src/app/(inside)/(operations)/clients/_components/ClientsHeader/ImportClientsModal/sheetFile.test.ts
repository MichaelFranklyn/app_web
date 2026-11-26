import ExcelJS from "exceljs";
import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";

import { ImportSheet } from "./interface";
import { buildClientsSheetFile, CLIENTS_SHEET, LISTS_SHEET } from "./sheetFile";
import { parseClientsRows } from "./utils";

const sheet = (over: Partial<ImportSheet> = {}): ImportSheet => ({
  rows: [
    {
      cnpj: "11222333000181",
      notes: "Paga em dia",
      sellerEmail: "ana@x.com",
      factoryName: "Herc (12.345.678/0001-95)",
      factoryClientCode: "00123",
    },
  ],
  sellerEmails: ["ana@x.com", "beto@x.com"],
  factoryNames: ["Herc (12.345.678/0001-95)", "Herc (98.765.432/0001-10)"],
  ...over,
});

const open = async (data: ImportSheet) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await buildClientsSheetFile(data));
  return workbook;
};

describe("buildClientsSheetFile", () => {
  it("vendedor e fábrica têm lista suspensa, inclusive nas linhas em branco", async () => {
    const clients = (await open(sheet())).getWorksheet(CLIENTS_SHEET)!;
    for (const address of ["C2", "C400"]) {
      expect(clients.getCell(address).dataValidation).toMatchObject({
        type: "list",
        formulae: [`${LISTS_SHEET}!$A$2:$A$3`],
      });
    }
    expect(clients.getCell("D2").dataValidation).toMatchObject({
      type: "list",
      formulae: [`${LISTS_SHEET}!$B$2:$B$3`],
    });
    // CNPJ e observação continuam livres.
    expect(clients.getCell("A2").dataValidation).toBeFalsy();
  });

  it("a coluna do código é texto, para o Excel não comer os zeros", async () => {
    const clients = (await open(sheet())).getWorksheet(CLIENTS_SHEET)!;
    expect(clients.getCell("E1").value).toBe("Código do cliente na fábrica");
    expect(clients.getCell("E2").value).toBe("00123");
    expect(clients.getColumn("E").numFmt).toBe("@");
    expect(clients.getCell("E2").dataValidation).toBeFalsy();
  });

  it("as listas ficam numa aba que ninguém vê, depois da de clientes", async () => {
    const workbook = await open(sheet());
    expect(workbook.worksheets.map((w) => w.name)).toEqual([
      CLIENTS_SHEET,
      LISTS_SHEET,
    ]);
    const lists = workbook.getWorksheet(LISTS_SHEET)!;
    expect(lists.state).toBe("veryHidden");
    expect(lists.getCell("A3").value).toBe("beto@x.com");
    expect(lists.getCell("B3").value).toBe("Herc (98.765.432/0001-10)");
  });

  it("sem vendedor ativo, a coluna fica sem lista em vez de travada", async () => {
    const clients = (await open(sheet({ sellerEmails: [] }))).getWorksheet(
      CLIENTS_SHEET
    )!;
    expect(clients.getCell("C2").dataValidation).toBeFalsy();
    expect(clients.getCell("D2").dataValidation).toBeTruthy();
  });

  it("a importação lê a planilha baixada de volta, pela primeira aba", async () => {
    const workbook = XLSX.read(await buildClientsSheetFile(sheet()), {
      type: "array",
    });
    const matrix = XLSX.utils.sheet_to_json<string[]>(
      workbook.Sheets[workbook.SheetNames[0]],
      { header: 1, raw: false, defval: "", blankrows: false }
    );
    expect(parseClientsRows(matrix)).toEqual([
      {
        cnpj: "11222333000181",
        notes: "Paga em dia",
        sellerEmail: "ana@x.com",
        factoryName: "Herc (12.345.678/0001-95)",
        factoryClientCode: "00123",
      },
    ]);
  });
});
