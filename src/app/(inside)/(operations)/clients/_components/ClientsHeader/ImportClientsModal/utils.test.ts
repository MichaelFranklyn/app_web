import { describe, expect, it } from "vitest";

import { parseClientsFile } from "./utils";

// CSV com células sempre entre aspas → vírgula vira delimitador de forma
// determinística (o detector escolhe "," e vírgulas dentro do campo ficam
// protegidas pelas aspas).
const toCsv = (rows: string[][]): string =>
  rows
    .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
    .join("\n");

const HEADER = ["CNPJ", "Observações"];

describe("parseClientsFile", () => {
  it("descarta o cabeçalho e mapeia CNPJ (só dígitos) + observação", () => {
    const csv = toCsv([HEADER, ["11.222.333/0001-81", "Cliente indicado"]]);
    expect(parseClientsFile(csv)).toEqual([
      { cnpj: "11222333000181", notes: "Cliente indicado" },
    ]);
  });

  it("observação vazia ou só espaços vira null", () => {
    const csv = toCsv([HEADER, ["00.000.000/0001-91", "   "]]);
    expect(parseClientsFile(csv)[0].notes).toBeNull();
  });

  it("mapeia múltiplas linhas preservando a ordem", () => {
    const csv = toCsv([
      HEADER,
      ["11.222.333/0001-81", "A"],
      ["00.000.000/0001-91", "B"],
    ]);
    const rows = parseClientsFile(csv);
    expect(rows.map((r) => r.cnpj)).toEqual([
      "11222333000181",
      "00000000000191",
    ]);
  });

  it("planilha só com cabeçalho (sem dados) lança erro", () => {
    expect(() => parseClientsFile(toCsv([HEADER]))).toThrow(
      "A planilha não contém linhas de dados."
    );
  });
});
