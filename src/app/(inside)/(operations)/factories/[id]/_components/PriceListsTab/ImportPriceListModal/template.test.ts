import { describe, expect, it } from "vitest";

import {
  autoGuessMapping,
  isMappingComplete,
} from "../../../_shared/productImportMapping";
import { PRICE_REQUIRED_FIELDS } from "./build";
import { EXAMPLE_HEADERS } from "./template";
import { guessColumns } from "./wizardGuess";

/**
 * A planilha modelo existe para o wizard reconhecer tudo sozinho — se um
 * cabeçalho dela deixar de ser mapeado, o usuário que baixou o modelo e o
 * preencheu certo cai num passo de mapeamento manual sem entender por quê.
 */
const EXAMPLE_ROW = [
  "101",
  "TORNEIRA JARDIM 1/2 BRANCA",
  "TORNEIRAS",
  "Peça",
  "Caixa",
  "12",
  "3922.10.00",
  "3,25",
  "45",
  "20,5",
  "20,5",
  "16,87",
  "15,18",
];

describe("planilha modelo da tabela de preço", () => {
  it("tem os campos obrigatórios do import auto-mapeados", () => {
    const mapping = autoGuessMapping(EXAMPLE_HEADERS);

    expect(isMappingComplete(mapping, PRICE_REQUIRED_FIELDS)).toBe(true);
  });

  it("mapeia cada coluna base na posição certa do modelo", () => {
    const mapping = autoGuessMapping(EXAMPLE_HEADERS);

    expect(mapping.sku).toEqual({ kind: "column", index: 0 });
    expect(mapping.name).toEqual({ kind: "column", index: 1 });
    expect(mapping.category).toEqual({ kind: "column", index: 2 });
    expect(mapping.unit).toEqual({ kind: "column", index: 3 });
    expect(mapping.unitLabel).toEqual({ kind: "column", index: 4 });
    expect(mapping.unitPerPack).toEqual({ kind: "column", index: 5 });
  });

  it("reconhece as colunas fiscais (NCM, IPI e ST por MVA)", () => {
    const guessed = guessColumns([EXAMPLE_HEADERS, EXAMPLE_ROW]);

    expect(guessed.headerIndex).toBe(0);
    expect(guessed.ncmChoice).toEqual({ kind: "column", index: 6 });
    expect(guessed.ipiChoice).toEqual({ kind: "column", index: 7 });
    expect(guessed.stMva.mva).toEqual({ kind: "column", index: 8 });
    expect(guessed.stMva.icmsCredit).toEqual({ kind: "column", index: 9 });
    expect(guessed.stMva.internalRate).toEqual({ kind: "column", index: 10 });
  });

  it("o IPI do modelo é percentual, não fração", () => {
    // 3,25 = 3,25%. Se o detector achasse fração, o backend multiplicaria por
    // 100 e o produto sairia com 325% de IPI.
    const guessed = guessColumns([EXAMPLE_HEADERS, EXAMPLE_ROW]);

    expect(guessed.ipiAsFraction).toBe(false);
  });
});
