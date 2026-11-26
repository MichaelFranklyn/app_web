import { describe, expect, it } from "vitest";

import { buildSheetMatrix, parseClientsRows, SHEET_HEADERS } from "./utils";

// O arquivo (xlsx ou csv) já chega ao parser como matriz de células, via
// readSpreadsheet — aqui basta montar a matriz.
const HEADER = ["CNPJ", "Observações"];

describe("parseClientsRows", () => {
  it("descarta o cabeçalho e mapeia CNPJ (só dígitos) + observação", () => {
    expect(
      parseClientsRows([HEADER, ["11.222.333/0001-81", "Cliente indicado"]])
    ).toEqual([
      {
        cnpj: "11222333000181",
        notes: "Cliente indicado",
        sellerEmail: null,
        factoryName: null,
        factoryClientCode: null,
      },
    ]);
  });

  it("observação vazia ou só espaços vira null", () => {
    expect(
      parseClientsRows([HEADER, ["00.000.000/0001-91", "   "]])[0].notes
    ).toBeNull();
  });

  it("CNPJ sem máscara (como o Excel entrega) passa igual", () => {
    expect(parseClientsRows([HEADER, ["11222333000181", ""]])[0].cnpj).toBe(
      "11222333000181"
    );
  });

  it("linha sem a coluna de observação não quebra", () => {
    expect(parseClientsRows([HEADER, ["11.222.333/0001-81"]])).toEqual([
      {
        cnpj: "11222333000181",
        notes: null,
        sellerEmail: null,
        factoryName: null,
        factoryClientCode: null,
      },
    ]);
  });

  it("mapeia múltiplas linhas preservando a ordem", () => {
    const rows = parseClientsRows([
      HEADER,
      ["11.222.333/0001-81", "A"],
      ["00.000.000/0001-91", "B"],
    ]);
    expect(rows.map((r) => r.cnpj)).toEqual([
      "11222333000181",
      "00000000000191",
    ]);
  });

  it("planilha só com cabeçalho (sem dados) lança erro", () => {
    expect(() => parseClientsRows([HEADER])).toThrow(
      "A planilha não contém linhas de dados."
    );
  });
});

describe("parseClientsRows — lista exportada de outro sistema", () => {
  it("acha o CNPJ pelo título, em qualquer coluna", () => {
    const rows = parseClientsRows([
      ["Razão social", "Nome fantasia", "CPF/CNPJ", "Cidade"],
      ["Loja A LTDA", "Loja A", "11.222.333/0001-81", "Salvador"],
    ]);
    expect(rows).toEqual([
      {
        cnpj: "11222333000181",
        notes: null,
        sellerEmail: null,
        factoryName: null,
        factoryClientCode: null,
      },
    ]);
  });

  it("sem título conhecido, acha a coluna com cara de CNPJ", () => {
    const rows = parseClientsRows([
      ["Cliente", "Doc", "UF"],
      ["Loja A", "11.222.333/0001-81", "BA"],
      ["Loja B", "00.000.000/0001-91", "BA"],
    ]);
    expect(rows.map((r) => r.cnpj)).toEqual([
      "11222333000181",
      "00000000000191",
    ]);
    expect(rows[0].notes).toBeNull();
  });
});

describe("parseClientsRows — vendedor e fábrica", () => {
  it("uma linha por fábrica, repetindo o CNPJ", () => {
    const rows = parseClientsRows([
      SHEET_HEADERS,
      ["11.222.333/0001-81", "Paga em dia", "ana@x.com", "Herc"],
      ["11.222.333/0001-81", "Paga em dia", " ana@x.com ", "Sol"],
    ]);
    expect(rows).toEqual([
      {
        cnpj: "11222333000181",
        notes: "Paga em dia",
        sellerEmail: "ana@x.com",
        factoryName: "Herc",
        factoryClientCode: null,
      },
      {
        cnpj: "11222333000181",
        notes: "Paga em dia",
        sellerEmail: "ana@x.com",
        factoryName: "Sol",
        factoryClientCode: null,
      },
    ]);
  });

  it("acha vendedor e fábrica pelo título, sem acento e em qualquer ordem", () => {
    const rows = parseClientsRows([
      ["Fabrica", "CNPJ", "Vendedor"],
      ["Herc", "11.222.333/0001-81", "ana@x.com"],
    ]);
    expect(rows[0]).toMatchObject({
      sellerEmail: "ana@x.com",
      factoryName: "Herc",
      notes: null,
    });
  });

  it("lê o código do cliente na fábrica como texto, com zeros à esquerda", () => {
    const rows = parseClientsRows([
      SHEET_HEADERS,
      ["11.222.333/0001-81", "", "ana@x.com", "Herc", " 00123 "],
      ["11.222.333/0001-81", "", "ana@x.com", "Sol", ""],
    ]);
    expect(rows.map((r) => r.factoryClientCode)).toEqual(["00123", null]);
  });

  it("acha o código por títulos de outros sistemas", () => {
    const rows = parseClientsRows([
      ["CNPJ", "Cód. cliente", "Fábrica"],
      ["11.222.333/0001-81", "A-77", "Herc"],
    ]);
    expect(rows[0].factoryClientCode).toBe("A-77");
  });

  it("ignora linha totalmente vazia no meio da planilha", () => {
    const rows = parseClientsRows([
      SHEET_HEADERS,
      ["11.222.333/0001-81", "", "", ""],
      ["", "", "", ""],
    ]);
    expect(rows).toHaveLength(1);
  });
});

describe("buildSheetMatrix", () => {
  it("traz a carteira com o CNPJ formatado e campos vazios em branco", () => {
    expect(
      buildSheetMatrix([
        {
          cnpj: "11222333000181",
          notes: null,
          sellerEmail: "ana@x.com",
          factoryName: "Herc",
          factoryClientCode: "00123",
        },
        { cnpj: "45723174000110" },
      ])
    ).toEqual([
      SHEET_HEADERS,
      ["11.222.333/0001-81", "", "ana@x.com", "Herc", "00123"],
      ["45.723.174/0001-10", "", "", "", ""],
    ]);
  });

  it("carteira vazia sai com a linha de exemplo", () => {
    const matrix = buildSheetMatrix([]);
    expect(matrix[0]).toEqual(SHEET_HEADERS);
    expect(matrix).toHaveLength(2);
  });

  it("a planilha baixada volta igual pelo parser", () => {
    const matrix = buildSheetMatrix([
      {
        cnpj: "11222333000181",
        notes: "Obs",
        sellerEmail: "ana@x.com",
        factoryName: "Herc",
        factoryClientCode: "00123",
      },
    ]);
    expect(parseClientsRows(matrix)).toEqual([
      {
        cnpj: "11222333000181",
        notes: "Obs",
        sellerEmail: "ana@x.com",
        factoryName: "Herc",
        factoryClientCode: "00123",
      },
    ]);
  });
});
