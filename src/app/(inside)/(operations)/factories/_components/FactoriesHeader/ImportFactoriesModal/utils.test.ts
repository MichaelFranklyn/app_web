import { describe, expect, it } from "vitest";

import { parseFactoriesRows } from "./utils";

// O arquivo (xlsx ou csv) já chega ao parser como matriz de células, via
// readSpreadsheet — aqui basta montar a matriz.
const HEADER = [
  "CNPJ",
  "Taxa",
  "Base",
  "Dia",
  "Território",
  "Início",
  "Término",
  "Condições",
];

const row = (cells: string[]) => [HEADER, cells];

describe("parseFactoriesRows", () => {
  it("mapeia uma linha completa em input do vínculo", () => {
    expect(
      parseFactoriesRows(
        row([
          "11.222.333/0001-81",
          "7.5",
          "Faturamento",
          "10",
          "Sul",
          "2025-01-01",
          "2025-12-31",
          "Frete por conta da fábrica",
        ])
      )
    ).toEqual([
      {
        cnpj: "11222333000181",
        commissionRate: 7.5,
        commissionCalcBasis: "Faturamento",
        paymentTermDays: 10,
        territory: "Sul",
        contractStart: "2025-01-01",
        contractEnd: "2025-12-31",
        specialConditions: { note: "Frete por conta da fábrica" },
      },
    ]);
  });

  it("aceita vírgula como separador decimal na taxa de comissão", () => {
    expect(
      parseFactoriesRows(
        row(["00.000.000/0001-91", "7,5", "Pagamento", "5", "", "", "", ""])
      )[0].commissionRate
    ).toBe(7.5);
  });

  it("dia de pagamento ignora texto extra e mantém só os dígitos", () => {
    expect(
      parseFactoriesRows(
        row(["00.000.000/0001-91", "5", "Pagamento", "dia 15", "", "", "", ""])
      )[0].paymentTermDays
    ).toBe(15);
  });

  it("datas vazias viram null e condição vazia vira specialConditions null", () => {
    expect(
      parseFactoriesRows(
        row([
          "00.000.000/0001-91",
          "5",
          "Pagamento",
          "5",
          "Nacional",
          "",
          "",
          "   ",
        ])
      )[0]
    ).toMatchObject({
      contractStart: null,
      contractEnd: null,
      specialConditions: null,
    });
  });

  it("planilha só com cabeçalho (sem dados) lança erro", () => {
    expect(() => parseFactoriesRows([HEADER])).toThrow(
      "A planilha não contém linhas de dados."
    );
  });
});
