import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";

import { readWorkbook } from "@/utils/import/reader";

import { buildOrderSheetFile } from "./build";
import { sheetPackageFixture } from "./fixture";
import { COL, EXTRA, EXTRA_COL, HEAD, HEAD_COL, ITEMS } from "./layout";
import { isOrderSheet, readOrderSheet } from "./read";

/** Endereços tirados do layout: mover um campo na folha não quebra o teste. */
const CNPJ = `${HEAD_COL.leftValue}${HEAD.cnpj}`;
const FACTORY = `${HEAD_COL.rightValue}${HEAD.factory}`;
const TERM = `${HEAD_COL.rightValue}${HEAD.paymentTerm}`;
const FREIGHT = `${HEAD_COL.rightValue}${HEAD.freight}`;
const DELIVERY = `${HEAD_COL.rightValue}${HEAD.deliveryDays}`;
const COVERAGE = `${HEAD_COL.rightValue}${HEAD.coverageDays}`;
const NOTES = `${EXTRA_COL.value}${EXTRA.notes}`;
const item = (offset: number, column: string) =>
  `${column}${ITEMS.first + offset}`;

/**
 * Ida e volta completa: gera a ficha, preenche como o vendedor preencheria,
 * salva, e lê de volta pelo MESMO caminho do wizard (`readWorkbook`, SheetJS).
 *
 * É o teste que importa: a geração usa ExcelJS e a leitura usa SheetJS, e as
 * duas bibliotecas discordam sobre o que é uma linha vazia.
 */
const roundTrip = async (fill: (form: ExcelJS.Worksheet) => void) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await buildOrderSheetFile(sheetPackageFixture()));
  fill(workbook.getWorksheet("FICHA DE PEDIDO")!);

  const buffer = await workbook.xlsx.writeBuffer();
  // jsdom não implementa File.arrayBuffer(); readWorkbook só usa name/type e
  // ele — mesmo stub que os testes do leitor usam.
  const file = {
    name: "Pedido - Alto - 02-09.xlsx",
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    arrayBuffer: async () => buffer,
  } as unknown as File;
  return readWorkbook(file);
};

const preenchida = (form: ExcelJS.Worksheet) => {
  form.getCell(CNPJ).value = "51.909.936/0001-70";
  form.getCell(FACTORY).value = "HERC";
  form.getCell(TERM).value = "30/45/60";
  form.getCell(FREIGHT).value = "CIF";
  form.getCell(DELIVERY).value = 15;
  form.getCell(COVERAGE).value = 30;
  form.getCell(NOTES).value = "Entregar depois do dia 10.";
  form.getCell(item(0, COL.sku)).value = "1000000011";
  form.getCell(item(0, COL.packQty)).value = 10;
  form.getCell(item(1, COL.sku)).value = "1000000011";
  form.getCell(item(1, COL.packQty)).value = 5;
  form.getCell(item(1, COL.discount)).value = 12;
};

describe("reconhecer a ficha", () => {
  it("reconhece pela assinatura do _META", async () => {
    expect(isOrderSheet(await roundTrip(preenchida))).toBe(true);
  });

  it("não confunde com um arquivo de fábrica qualquer", async () => {
    expect(
      isOrderSheet({
        sheetNames: ["Plan1"],
        sheets: { Plan1: [["CODIGO", "QTD"]] },
      })
    ).toBe(false);
  });
});

describe("ler a ficha preenchida", () => {
  it("resolve cliente e fábrica por id, não por nome", async () => {
    // Casar por texto acertaria o pedido no cliente errado sem avisar.
    const read = readOrderSheet(await roundTrip(preenchida));

    expect(read.clientId).toBe("client-1");
    expect(read.factoryId).toBe("factory-herc");
    expect(read.cnpjDigits).toBe("51909936000170");
  });

  it("traz de quem é a ficha, para o pedido não mudar de dono", async () => {
    const read = readOrderSheet(await roundTrip(preenchida));

    expect(read.meta.sellerId).toBe("seller-1");
    expect(read.meta.sellerName).toBe("Rafael");
    expect(read.meta.generatedAt).toBe("2026-09-02");
    expect(read.meta.priceListIds).toEqual(["list-herc", "list-silvana"]);
  });

  it("lê o que o vendedor combinou com o cliente", async () => {
    const read = readOrderSheet(await roundTrip(preenchida));

    expect(read.paymentTermName).toBe("30/45/60");
    expect(read.freightType).toBe("CIF");
    expect(read.deliveryEstimateDays).toBe(15);
    expect(read.coverageDays).toBe(30);
  });

  it("lê as abas fora de alcance do vendedor", async () => {
    // As listas vão `veryHidden` para ninguém mexer nelas por engano. Se o
    // leitor da importação as pulasse, a ficha subiria sem cliente, sem
    // fábrica e sem itens — e o defeito só apareceria em produção.
    const read = readOrderSheet(await roundTrip(preenchida));

    expect(read.meta.companyId).toBeTruthy();
    expect(read.clientId).toBeTruthy();
    expect(read.factoryId).toBeTruthy();
    expect(read.items).not.toHaveLength(0);
  });

  it("traz a observação da coluna de extras", async () => {
    // Ela é escrita fora da área de impressão (o cliente não a vê no papel) e
    // sobe como a observação do pedido — senão sumiria ao subir o arquivo.
    const read = readOrderSheet(await roundTrip(preenchida));

    expect(read.notes).toBe("Entregar depois do dia 10.");
  });

  it("converte embalagens em unidades pelo catálogo da própria ficha", async () => {
    // É essa a embalagem que o vendedor tinha na frente quando contou as caixas.
    const read = readOrderSheet(await roundTrip(preenchida));

    expect(read.items).toEqual([
      { sku: "1000000011", packQty: 10, quantity: 120, discountPercent: 0 },
      { sku: "1000000011", packQty: 5, quantity: 60, discountPercent: 12 },
    ]);
  });

  it("ignora linha sem código ou sem quantidade", async () => {
    const read = readOrderSheet(
      await roundTrip((form) => {
        preenchida(form);
        form.getCell(item(2, COL.sku)).value = "90281"; // sem quantidade
        form.getCell(item(3, COL.packQty)).value = 3; // sem código
      })
    );

    expect(read.items).toHaveLength(2);
  });

  it("devolve o CNPJ mesmo quando ele não está na carteira da ficha", async () => {
    // Quem avisa é a tela: aqui o que importa é não inventar um cliente.
    const read = readOrderSheet(
      await roundTrip((form) => {
        form.getCell(CNPJ).value = "11.111.111/0001-11";
        form.getCell(FACTORY).value = "HERC";
      })
    );

    expect(read.cnpjDigits).toBe("11111111000111");
    expect(read.clientId).toBeNull();
  });

  it("lê uma ficha em branco sem quebrar", async () => {
    const read = readOrderSheet(await roundTrip(() => {}));

    expect(read.items).toEqual([]);
    expect(read.clientId).toBeNull();
    expect(read.factoryId).toBeNull();
  });
});
