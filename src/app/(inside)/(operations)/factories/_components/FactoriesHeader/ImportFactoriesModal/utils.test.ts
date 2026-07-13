import { describe, expect, it } from "vitest";

import { parseFactoriesFile } from "./utils";

// Células sempre entre aspas: o delimitador vira "," de forma determinística e
// decimais com vírgula ("7,5") ficam protegidos dentro do campo.
const toCsv = (rows: string[][]): string =>
  rows
    .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
    .join("\n");

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

const row = (cells: string[]) => toCsv([HEADER, cells]);

describe("parseFactoriesFile", () => {
  it("mapeia uma linha completa em input do vínculo", () => {
    const csv = row([
      "11.222.333/0001-81",
      "7.5",
      "Faturado",
      "10",
      "Sul",
      "2025-01-01",
      "2025-12-31",
      "Frete por conta da fábrica",
    ]);
    expect(parseFactoriesFile(csv)).toEqual([
      {
        cnpj: "11222333000181",
        commissionRate: 7.5,
        commissionCalcBasis: "Faturado",
        paymentTermDays: 10,
        territory: "Sul",
        contractStart: "2025-01-01",
        contractEnd: "2025-12-31",
        specialConditions: { note: "Frete por conta da fábrica" },
      },
    ]);
  });

  it("aceita vírgula como separador decimal na taxa de comissão", () => {
    const csv = row([
      "00.000.000/0001-91",
      "7,5",
      "Pedido",
      "5",
      "",
      "",
      "",
      "",
    ]);
    expect(parseFactoriesFile(csv)[0].commissionRate).toBe(7.5);
  });

  it("dia de pagamento ignora texto extra e mantém só os dígitos", () => {
    const csv = row([
      "00.000.000/0001-91",
      "5",
      "Pedido",
      "dia 15",
      "",
      "",
      "",
      "",
    ]);
    expect(parseFactoriesFile(csv)[0].paymentTermDays).toBe(15);
  });

  it("datas vazias viram null e condição vazia vira specialConditions null", () => {
    const csv = row([
      "00.000.000/0001-91",
      "5",
      "Pedido",
      "5",
      "Nacional",
      "",
      "",
      "   ",
    ]);
    expect(parseFactoriesFile(csv)[0]).toMatchObject({
      contractStart: null,
      contractEnd: null,
      specialConditions: null,
    });
  });

  it("planilha só com cabeçalho (sem dados) lança erro", () => {
    expect(() => parseFactoriesFile(toCsv([HEADER]))).toThrow(
      "A planilha não contém linhas de dados."
    );
  });
});
