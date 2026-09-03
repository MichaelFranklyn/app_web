import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

import { buildOrderSheetFile } from "./build";
import { sheetPackageFixture } from "./fixture";
import {
  CLIENT_NOTE_ROW,
  COL,
  EXTRA,
  EXTRA_COL,
  HEAD,
  HEAD_COL,
  ITEMS,
} from "./layout";

/** Gera a ficha e a abre de volta, como o Excel do vendedor faria. */
const reopen = async () => {
  const file = await buildOrderSheetFile(sheetPackageFixture());
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(file);
  return workbook;
};

/**
 * A proteção da aba, que o ExcelJS grava e lê mas não declara no tipo público.
 */
const sheetProtectionOf = (sheet: ExcelJS.Worksheet) =>
  (
    sheet as unknown as {
      sheetProtection?: {
        sheet?: boolean;
        hashValue?: string;
        formatColumns?: boolean;
        formatRows?: boolean;
      };
    }
  ).sheetProtection;

/** Os nomes definidos como eles SAEM no arquivo, sem passar pelo ExcelJS. */
const definedNames = async (): Promise<Record<string, string>> => {
  const file = await buildOrderSheetFile(sheetPackageFixture());
  const parsed = XLSX.read(file, { type: "array", bookFiles: true });
  return Object.fromEntries(
    (parsed.Workbook?.Names ?? []).map((name) => [name.Name, name.Ref])
  );
};

describe("ficha de pedido", () => {
  it("abre com uma aba só, e as outras fora de alcance", async () => {
    // O vendedor não tem nada a fazer nas listas — e uma aba de 1.400 linhas
    // aberta na frente do cliente é ruído. `veryHidden` e não `hidden`: a
    // escondida comum aparece na caixa "Reexibir", a um clique de quebrar as
    // fórmulas sem perceber.
    const workbook = await reopen();

    expect(workbook.worksheets).toHaveLength(6);
    workbook.worksheets.forEach((sheet) => {
      expect(sheet.state).toBe(
        sheet.name === "FICHA DE PEDIDO" ? "visible" : "veryHidden"
      );
    });
  });

  it("trava a folha com senha, e deixa passar o que não quebra nada", async () => {
    // Sem senha, "Desproteger planilha" é um clique distraído; com ela, é uma
    // decisão. Largura de coluna e altura de linha seguem livres — mexer nelas
    // é ler melhor, não quebrar a ficha.
    const workbook = await reopen();
    const protection = sheetProtectionOf(
      workbook.getWorksheet("FICHA DE PEDIDO")!
    );

    expect(protection?.sheet).toBe(true);
    expect(protection?.hashValue).toBeTruthy();
    expect(protection?.formatColumns).toBe(true);
    expect(protection?.formatRows).toBe(true);
  });

  it("mostra de quem é a ficha e de quando são os preços", async () => {
    // É o que denuncia a ficha do mês passado reaproveitada com "salvar como".
    const workbook = await reopen();
    const form = workbook.getWorksheet("FICHA DE PEDIDO")!;

    expect(form.getCell(`G${HEAD.identity}`).value).toBe(
      "Rafael  ·  preços de 02/09/2026"
    );
  });

  it("resolve o cliente pelo CNPJ digitado, com ou sem máscara", async () => {
    const workbook = await reopen();
    const form = workbook.getWorksheet("FICHA DE PEDIDO")!;
    const razao = form.getCell(`${HEAD_COL.leftValue}${HEAD.razaoSocial}`)
      .value as { formula: string };

    expect(razao.formula).toContain("CLIENTES");
    expect(razao.formula).toContain("SUBSTITUTE");
    expect(razao.formula).toContain(
      `TEXT($${HEAD_COL.leftValue}$${HEAD.cnpj},"0")`
    );
  });

  it("busca o preço na coluna do nível acordado", async () => {
    const workbook = await reopen();
    const form = workbook.getWorksheet("FICHA DE PEDIDO")!;
    const preco = form.getCell(`${COL.packPrice}${ITEMS.first}`).value as {
      formula: string;
    };

    // MATCH pelo nome do nível: trocar o cliente troca a coluna de preço inteira.
    // O nível é lido da coluna extra ($N$8), fora da área de impressão.
    expect(preco.formula).toContain(
      `MATCH($${EXTRA_COL.value}$${EXTRA.tier},CATALOGO!$A$1:$K$1,0)`
    );
    expect(preco.formula).toContain(
      `$${HEAD_COL.rightValue}$${HEAD.factory}&"|"&${COL.sku}${ITEMS.first}`
    );
  });

  it("soma imposto e desconto no total da linha", async () => {
    const workbook = await reopen();
    const form = workbook.getWorksheet("FICHA DE PEDIDO")!;
    const total = form.getCell(`${COL.total}${ITEMS.first}`).value as {
      formula: string;
    };

    expect(total.formula).toBe(
      'IF(OR(E16="",G16=""),"",E16*G16*(1-IF(H16="",0,H16)/100)*(1+IF(I16="",0,I16)/100))'
    );
  });

  it("não guarda resultado de fórmula nenhuma", async () => {
    // O importador lê só célula digitada. Um resultado gravado aqui viraria um
    // cache que a leitura poderia confundir com dado do vendedor.
    const workbook = await reopen();
    const form = workbook.getWorksheet("FICHA DE PEDIDO")!;

    const comResultado = [
      `${HEAD_COL.leftValue}${HEAD.razaoSocial}`,
      `${COL.packPrice}${ITEMS.first}`,
      `${COL.total}${ITEMS.first}`,
    ].filter((address) => "result" in (form.getCell(address).value as object));
    expect(comResultado).toEqual([]);
  });

  it("oferece as fábricas do vendedor em lista", async () => {
    const workbook = await reopen();
    const form = workbook.getWorksheet("FICHA DE PEDIDO")!;

    expect(
      form.getCell(`${HEAD_COL.rightValue}${HEAD.factory}`).dataValidation
    ).toMatchObject({
      type: "list",
      formulae: ["FABRICAS!$A$2:$A$3"],
    });
  });

  it("oferece só os prazos da fábrica escolhida", async () => {
    const workbook = await reopen();
    const form = workbook.getWorksheet("FICHA DE PEDIDO")!;

    const prazo = form.getCell(
      `${HEAD_COL.rightValue}${HEAD.paymentTerm}`
    ).dataValidation;
    expect(prazo?.formulae?.[0]).toBe(
      `INDIRECT("PRAZOS_"&MATCH($${HEAD_COL.rightValue}$${HEAD.factory},FABRICAS!$A:$A,0))`
    );
  });

  it("nomeia os prazos pela linha da fábrica", async () => {
    // O nome é numerado pela linha para não depender do nome da fábrica, que
    // tem espaço e acento e não serve como nome definido no Excel.
    const workbook = await reopen();

    expect(workbook.definedNames.getRanges("PRAZOS_2").ranges).toEqual([
      "FABRICAS!$E$2:$F$2",
    ]);
    // Fábrica com um prazo só vira uma célula — lista de um item, e não erro.
    expect(workbook.definedNames.getRanges("PRAZOS_3").ranges).toEqual([
      "FABRICAS!$E$3",
    ]);
  });

  it("deixa livres só as células que o vendedor preenche", async () => {
    const workbook = await reopen();
    const form = workbook.getWorksheet("FICHA DE PEDIDO")!;

    const livre = (address: string) =>
      form.getCell(address).protection?.locked === false;

    expect(livre(`${HEAD_COL.leftValue}${HEAD.cnpj}`)).toBe(true);
    expect(livre(`${HEAD_COL.rightValue}${HEAD.coverageDays}`)).toBe(true);
    expect(livre(`${COL.sku}${ITEMS.first}`)).toBe(true);
    expect(livre(`${COL.packQty}${ITEMS.first}`)).toBe(true);
    expect(livre(`${COL.discount}${ITEMS.first}`)).toBe(true);
    // A coluna de preço é fórmula: destravá-la é o acidente que a proteção evita.
    expect(livre(`${COL.packPrice}${ITEMS.first}`)).toBe(false);
  });

  it("não imprime o que o cliente não deve ver", async () => {
    // O vendedor imprime a ficha e entrega ao cliente. A impressão para na
    // coluna J: o nível acordado e as observações ficam à direita disso.
    const workbook = await reopen();
    const form = workbook.getWorksheet("FICHA DE PEDIDO")!;

    expect(form.pageSetup.printArea).toBe(`A1:J${CLIENT_NOTE_ROW}`);
    expect(EXTRA_COL.label > COL.total).toBe(true);
    expect(form.getCell(`${EXTRA_COL.label}${EXTRA.tier}`).value).toBe(
      "NÍVEL ACORDADO"
    );
    expect(form.getCell(`${EXTRA_COL.label}${EXTRA.notes}`).value).toBe(
      "OBSERVAÇÕES"
    );
    // A caixa de observações é do vendedor: tem de estar livre para digitar.
    expect(
      form.getCell(`${EXTRA_COL.value}${EXTRA.notes}`).protection?.locked
    ).toBe(false);
    // O que sobra no papel é do cliente: a data dos preços.
    expect(String(form.getCell(`A${CLIENT_NOTE_ROW}`).value)).toContain(
      "Valores de 02/09/2026"
    );
  });

  it("escreve a área de impressão absoluta nas duas pontas", async () => {
    // O ExcelJS normaliza a área na LEITURA, então o teste acima não veria o
    // defeito: é preciso olhar o que foi para o arquivo. Com a linha relativa
    // (`$A1:$J58`), o LibreOffice ignora a área e imprime a folha inteira.
    const names = await definedNames();

    expect(names["_xlnm.Print_Area"]).toBe(
      `'FICHA DE PEDIDO'!$A$1:$J$${CLIENT_NOTE_ROW}`
    );
  });

  it("guarda o manual da folha na coluna que não imprime", async () => {
    // "Preencha os campos em amarelo" e "Informe o CNPJ para começar" são
    // conversa com o vendedor. No cabeçalho, elas iam junto para o papel.
    const workbook = await reopen();
    const form = workbook.getWorksheet("FICHA DE PEDIDO")!;

    expect(
      String(form.getCell(`${EXTRA_COL.label}${EXTRA.howTo}`).value)
    ).toContain("Preencha os campos em amarelo");

    const aviso = form.getCell(`${EXTRA_COL.label}${EXTRA.warning}`).value as {
      formula: string;
    };
    expect(aviso.formula).toContain("Informe o CNPJ do cliente para começar.");

    // E o cabeçalho impresso ficou só com o documento.
    const impresso = [`A${HEAD.identity}`, `A${HEAD.sectionTitle - 1}`].map(
      (address) => form.getCell(address).value
    );
    expect(impresso).toEqual([null, null]);
  });

  it("repete o cabeçalho da tabela na segunda página", async () => {
    const workbook = await reopen();
    const form = workbook.getWorksheet("FICHA DE PEDIDO")!;

    expect(form.pageSetup.printTitlesRow).toBe(
      `${ITEMS.header}:${ITEMS.header}`
    );
    expect(form.pageSetup.orientation).toBe("landscape");
  });

  it("carrega o catálogo e a carteira nas abas escondidas", async () => {
    const workbook = await reopen();

    expect(workbook.getWorksheet("CATALOGO")!.getCell("A2").value).toBe(
      "HERC|1000000011"
    );
    expect(workbook.getWorksheet("VINCULOS")!.getCell("A2").value).toBe(
      "51909936000170|HERC"
    );
    expect(workbook.getWorksheet("_META")!.getCell("B2").value).toBe(
      "girus-order-sheet"
    );
  });
});
