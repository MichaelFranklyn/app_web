import { describe, expect, it } from "vitest";

import {
  findStaleListColumns,
  guessColumns,
  looksLikeFraction,
} from "./wizardGuess";

// Cabeçalho estilo "Ficha Bahia": código/nome + NCM/IPI + colunas fiscais ST.
const HEADER = [
  "CODIGO",
  "NOME DO PRODUTO",
  "NCM",
  "IPI",
  "MVA",
  "ICMS CREDITO",
  "ALIQUOTA INTERNA",
];

describe("looksLikeFraction", () => {
  const rows = [
    ["a", "0,0325"],
    ["b", "0,0975"],
  ];

  it("kind 'none' nunca é fração", () => {
    expect(looksLikeFraction({ kind: "none" }, rows)).toBe(false);
  });

  it("coluna com todos os valores ≤ 1 é fração decimal", () => {
    expect(looksLikeFraction({ kind: "column", index: 1 }, rows)).toBe(true);
  });

  it("coluna com valor > 1 é percentual, não fração", () => {
    const percent = [
      ["a", "3,25"],
      ["b", "9,75"],
    ];
    expect(looksLikeFraction({ kind: "column", index: 1 }, percent)).toBe(
      false
    );
  });

  it("coluna sem nenhum número positivo não é fração", () => {
    expect(looksLikeFraction({ kind: "column", index: 1 }, [["a", ""]])).toBe(
      false
    );
  });
});

describe("guessColumns", () => {
  it("acha cabeçalho e mapeia IPI/NCM/ST pelos títulos", () => {
    const matrix = [
      HEADER,
      ["101", "Torneira", "3922.10.00", "3,25", "45", "20,5", "20,5"],
      ["205", "Chuveiro", "3926.90.90", "9,75", "40", "18", "18"],
    ];
    const g = guessColumns(matrix);

    expect(g.headerIndex).toBe(0);
    expect(g.ipiChoice).toEqual({ kind: "column", index: 3 });
    expect(g.ncmChoice).toEqual({ kind: "column", index: 2 });
    expect(g.stMva.mva).toEqual({ kind: "column", index: 4 });
    expect(g.stMva.icmsCredit).toEqual({ kind: "column", index: 5 });
    expect(g.stMva.internalRate).toEqual({ kind: "column", index: 6 });
    // Valores em percentual (3,25 / 20,5) → não são fração.
    expect(g.ipiAsFraction).toBe(false);
    expect(g.taxesAsFraction).toBe(false);
  });

  it("marca fração quando as alíquotas vêm em decimal (0,0325)", () => {
    const matrix = [
      HEADER,
      ["101", "Torneira", "3922.10.00", "0,0325", "45", "0,205", "0,205"],
    ];
    const g = guessColumns(matrix);

    expect(g.ipiAsFraction).toBe(true);
    expect(g.taxesAsFraction).toBe(true);
  });

  it("sem colunas fiscais, tudo vira 'none'", () => {
    const matrix = [
      ["CODIGO", "NOME DO PRODUTO", "PRECO"],
      ["101", "Torneira", "16,87"],
    ];
    const g = guessColumns(matrix);

    expect(g.ipiChoice).toEqual({ kind: "none" });
    expect(g.ncmChoice).toEqual({ kind: "none" });
    expect(g.stMva.mva).toEqual({ kind: "none" });
    expect(g.stMva.internalRate).toEqual({ kind: "none" });
    expect(g.ipiAsFraction).toBe(false);
  });

  it("prioridade dos hints do ICMS: 'icms cred' ganha da coluna 'icms' genérica", () => {
    const matrix = [
      ["CODIGO", "ICMS", "ICMS CREDITO"],
      ["101", "18", "20,5"],
    ];
    const g = guessColumns(matrix);

    // "icms créd"/"icms cred" tem prioridade → índice 2, não o "icms" no 1.
    expect(g.stMva.icmsCredit).toEqual({ kind: "column", index: 2 });
  });
});

describe("findStaleListColumns", () => {
  // Cabeçalho real da "LISTA 39 - NORDESTE": a lista anterior (38) e a vigente
  // (39) convivem com o mesmo nível DIAMANTE.
  const HEADER_39 = [
    "CÓD",
    "PRODUTO",
    "FAMÍLIA",
    "UNIDADE DE VENDA",
    "CAIXA MÁSTER",
    "LISTA 38 DIAMANTE",
    "%",
    "LISTA 39 DIAMANTE",
    "PLATINA",
    "OURO",
    "IPI",
  ];

  it("marca a coluna da lista anterior e aponta a vigente", () => {
    const stale = findStaleListColumns(HEADER_39);
    expect(stale).toHaveLength(1);
    expect(stale[0]).toMatchObject({
      index: 5,
      listNumber: 38,
      latestNumber: 39,
      latestHeader: "LISTA 39 DIAMANTE",
    });
  });

  it("sem número de lista repetido → nada a avisar", () => {
    // Planilha 24.06: níveis puros, sem "LISTA N".
    expect(
      findStaleListColumns(["CÓD", "PRODUTO", "DIAMANTE", "PLATINA", "OURO"])
    ).toEqual([]);
  });

  it("uma única LISTA N não é obsoleta", () => {
    expect(findStaleListColumns(["CÓD", "LISTA 39 DIAMANTE"])).toEqual([]);
  });

  it("mais de duas listas: só a mais recente escapa", () => {
    const stale = findStaleListColumns([
      "LISTA 37 OURO",
      "LISTA 38 OURO",
      "LISTA 39 OURO",
    ]);
    expect(stale.map((s) => s.listNumber)).toEqual([37, 38]);
    expect(stale.every((s) => s.latestNumber === 39)).toBe(true);
  });
});
