import { describe, expect, it } from "vitest";

import { parseClientsRows } from "./utils";

// O arquivo (xlsx ou csv) já chega ao parser como matriz de células, via
// readSpreadsheet — aqui basta montar a matriz.
const HEADER = ["CNPJ", "Observações"];

describe("parseClientsRows", () => {
  it("descarta o cabeçalho e mapeia CNPJ (só dígitos) + observação", () => {
    expect(
      parseClientsRows([HEADER, ["11.222.333/0001-81", "Cliente indicado"]])
    ).toEqual([{ cnpj: "11222333000181", notes: "Cliente indicado" }]);
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
      { cnpj: "11222333000181", notes: null },
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
