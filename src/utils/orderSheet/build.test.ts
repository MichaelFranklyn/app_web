import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

import { buildOrderSheetFile } from "./build";
import { sheetPackageFixture } from "./fixture";
import type { OrderSheetBrand } from "./interface";
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

describe("marca da ficha", () => {
  /** Um PNG de 1px: o teste olha onde a imagem entra, não o que ela mostra. */
  const PNG =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

  const reopenWithBrand = async (brand: OrderSheetBrand) => {
    const file = await buildOrderSheetFile(
      sheetPackageFixture(),
      undefined,
      brand
    );
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file);
    return workbook;
  };

  it("põe a representação à esquerda e o sistema à direita", async () => {
    // A ficha é documento que o cliente vê: quem assina é a representação, e a
    // marca do sistema fica do outro lado, discreta, como no rodapé dos PDFs.
    const workbook = await reopenWithBrand({
      companyLogo: { dataUrl: PNG, width: 200, height: 100 },
      companyName: "Contato Rep.",
      girusLogo: { dataUrl: PNG, width: 100, height: 100 },
    });
    const form = workbook.getWorksheet("FICHA DE PEDIDO")!;
    const images = form.getImages();

    expect(images).toHaveLength(2);
    expect(images[0].range.tl.nativeCol).toBe(0);
    expect(images[1].range.tl.nativeCol).toBe(7);
    // Com logo, o nome da empresa não é escrito — seria a marca duas vezes.
    expect(form.getCell(`A${HEAD.logos}`).value).toBeNull();
  });

  it("respeita a proporção da logo na altura da faixa", async () => {
    const workbook = await reopenWithBrand({
      companyLogo: { dataUrl: PNG, width: 300, height: 100 },
    });
    const [image] = workbook.getWorksheet("FICHA DE PEDIDO")!.getImages();

    // `ext` sai no arquivo mas não está no tipo público do ExcelJS.
    const { ext } = image.range as unknown as {
      ext: { width: number; height: number };
    };
    expect(ext).toMatchObject({ width: 102, height: 34 });
  });

  it("sem logo, escreve o nome da empresa — a ficha tem de dizer quem emite", async () => {
    const workbook = await reopenWithBrand({ companyName: "Contato Rep." });
    const form = workbook.getWorksheet("FICHA DE PEDIDO")!;

    expect(form.getImages()).toHaveLength(0);
    expect(form.getCell(`A${HEAD.logos}`).value).toBe("Contato Rep.");
    expect(form.getCell(`A${HEAD.logos}`).font).toMatchObject({ bold: true });
  });

  it("sem marca nenhuma, a ficha sai assim mesmo", async () => {
    // Logo que não carregou não pode impedir o vendedor de levar a ficha.
    const workbook = await reopenWithBrand({});
    const form = workbook.getWorksheet("FICHA DE PEDIDO")!;

    expect(form.getImages()).toHaveLength(0);
    expect(form.getCell(`A${HEAD.logos}`).value).toBeNull();
  });

  it("guarda a logo no formato em que ela veio", async () => {
    const workbook = await reopenWithBrand({
      companyLogo: {
        dataUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
        width: 100,
        height: 100,
      },
    });
    const [image] = workbook.getWorksheet("FICHA DE PEDIDO")!.getImages();

    expect(workbook.getImage(Number(image.imageId)).extension).toBe("jpeg");
  });
});

describe("fábrica sem prazo cadastrado", () => {
  it("não nomeia intervalo vazio", async () => {
    // Um nome definido apontando para intervalo inexistente faz o Excel abrir
    // a ficha com aviso de erro; sem prazos, simplesmente não há nome.
    const pkg = sheetPackageFixture();
    pkg.factories[1].paymentTerms = [];
    const file = await buildOrderSheetFile(pkg);
    const parsed = XLSX.read(file, { type: "array", bookFiles: true });
    const names = (parsed.Workbook?.Names ?? []).map((name) => name.Name);

    expect(names).toContain("PRAZOS_2");
    expect(names).not.toContain("PRAZOS_3");
  });
});
