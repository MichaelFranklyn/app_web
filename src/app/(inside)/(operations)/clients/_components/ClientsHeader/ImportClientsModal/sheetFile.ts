import type { Worksheet } from "exceljs";

import { ImportSheet } from "./interface";
import { buildSheetMatrix } from "./utils";

export const SHEET_FILE = "carteira-de-clientes.xlsx";
export const CLIENTS_SHEET = "Clientes";
export const LISTS_SHEET = "Listas";

const SELLER_COLUMN = "C";
const FACTORY_COLUMN = "D";
const CODE_COLUMN = "E";

/** Linhas com lista suspensa além das da carteira: espaço para cliente novo. */
const SPARE_ROWS = 300;
const MIN_ROWS = 500;

const COLUMN_WIDTHS = [22, 40, 34, 40, 30];

/**
 * A célula da linha `row` ganha a lista suspensa que aponta para a coluna da
 * aba de listas. Lista vazia (empresa sem vendedor ativo, sem fábrica) fica
 * sem validação: uma lista sem item travaria a coluna inteira.
 */
const addListValidation = (
  sheet: Worksheet,
  column: string,
  listColumn: string,
  count: number,
  lastRow: number,
  message: { title: string; prompt: string; error: string }
) => {
  if (count === 0) return;
  const range = `${LISTS_SHEET}!$${listColumn}$2:$${listColumn}$${count + 1}`;
  for (let row = 2; row <= lastRow; row += 1) {
    sheet.getCell(`${column}${row}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [range],
      showInputMessage: true,
      promptTitle: message.title,
      prompt: message.prompt,
      showErrorMessage: true,
      errorStyle: "stop",
      errorTitle: message.title,
      error: message.error,
    };
  }
};

/**
 * A planilha da carteira em bytes, com lista suspensa nas colunas de vendedor
 * e de fábrica.
 *
 * Escolher na lista em vez de digitar é o que evita o erro mais comum da
 * importação: o email com uma letra trocada, a fábrica escrita de outro jeito.
 * As listas moram numa aba `veryHidden` (não aparece nem em "Reexibir") e vão
 * DEPOIS da aba de clientes — a importação lê a primeira aba.
 *
 * Devolve o buffer (e não o download) para o teste abrir o arquivo de volta.
 */
export const buildClientsSheetFile = async (
  sheet: ImportSheet
): Promise<ArrayBuffer> => {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Itinus";

  const clients = workbook.addWorksheet(CLIENTS_SHEET, {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  clients.addRows(buildSheetMatrix(sheet.rows));
  clients.getRow(1).font = { bold: true };
  COLUMN_WIDTHS.forEach((width, index) => {
    clients.getColumn(index + 1).width = width;
  });
  // O código é texto: "00123" não pode virar 123 quando alguém digita na
  // célula — na fábrica são códigos diferentes.
  clients.getColumn(CODE_COLUMN).numFmt = "@";

  const lists = workbook.addWorksheet(LISTS_SHEET);
  lists.state = "veryHidden";
  lists.getColumn(1).values = ["Vendedores", ...sheet.sellerEmails];
  lists.getColumn(2).values = ["Fábricas", ...sheet.factoryNames];

  const lastRow = Math.max(sheet.rows.length + 1 + SPARE_ROWS, MIN_ROWS);
  addListValidation(
    clients,
    SELLER_COLUMN,
    "A",
    sheet.sellerEmails.length,
    lastRow,
    {
      title: "Vendedor",
      prompt: "Escolha o email do vendedor na lista.",
      error:
        "Escolha um vendedor da lista. Vendedor novo? Cadastre-o no sistema e baixe a planilha de novo.",
    }
  );
  addListValidation(
    clients,
    FACTORY_COLUMN,
    "B",
    sheet.factoryNames.length,
    lastRow,
    {
      title: "Fábrica",
      prompt: "Escolha a fábrica na lista.",
      error:
        "Escolha uma fábrica da lista. Fábrica nova? Cadastre-a no sistema e baixe a planilha de novo.",
    }
  );

  return workbook.xlsx.writeBuffer();
};

/** Gera a planilha e entrega o arquivo ao navegador. */
export const downloadClientsSheet = async (
  sheet: ImportSheet
): Promise<void> => {
  const blob = new Blob([await buildClientsSheetFile(sheet)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = SHEET_FILE;
  anchor.click();
  URL.revokeObjectURL(url);
};
