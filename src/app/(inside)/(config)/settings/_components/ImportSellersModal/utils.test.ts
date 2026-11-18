import { describe, expect, it } from "vitest";

import { parseSellersRows } from "./utils";

const HEADER = ["Nome", "Email", "CPF", "Região"];

describe("parseSellersRows", () => {
  it("mapeia uma linha completa", () => {
    expect(
      parseSellersRows([
        HEADER,
        [" Maria Souza ", "maria@empresa.com.br ", "123.456.789-09", "Sul"],
      ])
    ).toEqual([
      {
        name: "Maria Souza",
        email: "maria@empresa.com.br",
        cpf: "123.456.789-09",
        region: "Sul",
      },
    ]);
  });

  it("CPF e região vazios viram null", () => {
    expect(
      parseSellersRows([HEADER, ["João", "joao@empresa.com.br", "  ", ""]])[0]
    ).toMatchObject({ cpf: null, region: null });
  });

  it("linha com menos colunas não quebra", () => {
    expect(parseSellersRows([HEADER, ["Ana", "ana@x.com"]])[0]).toEqual({
      name: "Ana",
      email: "ana@x.com",
      cpf: null,
      region: null,
    });
  });

  it("descarta linhas totalmente vazias", () => {
    expect(
      parseSellersRows([HEADER, ["Ana", "ana@x.com"], ["", " ", "", ""]])
    ).toHaveLength(1);
  });

  it("planilha só com cabeçalho (ou só linhas vazias) lança erro", () => {
    expect(() => parseSellersRows([HEADER])).toThrow(
      "A planilha não contém linhas de dados."
    );
    expect(() => parseSellersRows([HEADER, ["", ""]])).toThrow(
      "A planilha não contém linhas de dados."
    );
  });
});
