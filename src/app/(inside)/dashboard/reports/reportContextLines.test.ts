import { describe, expect, it } from "vitest";

import { buildReportContextLines } from "./reportContextLines";

/**
 * O que se protege aqui é honestidade, não formatação: um relatório recortado e
 * impresso sem dizer o recorte é lido como se fosse a carteira inteira.
 */
describe("buildReportContextLines", () => {
  const base = {
    periodLabel: "01/07/2026 a 31/07/2026",
    sellerName: null,
    factoryName: null,
    hasFactoryFilter: false,
  };

  it("sem fábrica escolhida, não menciona fábrica", () => {
    // "Fábrica: todas" numa aba que não filtra por fábrica afirma o óbvio e
    // empurra a informação útil para baixo.
    expect(buildReportContextLines(base)).toEqual([
      "Período: 01/07/2026 a 31/07/2026",
      "Vendedor: todos",
    ]);
  });

  it("com fábrica escolhida, diz qual é", () => {
    expect(
      buildReportContextLines({
        ...base,
        sellerName: "Celso Ribeiro",
        factoryName: "Lukma",
        hasFactoryFilter: true,
      })
    ).toEqual([
      "Período: 01/07/2026 a 31/07/2026",
      "Vendedor: Celso Ribeiro",
      "Fábrica: Lukma",
    ]);
  });

  it("fábrica escolhida sem nome resolvido ainda declara o recorte", () => {
    // A lista pode não ter chegado (cache frio, erro parcial da query). Omitir
    // a linha faria o papel passar por "a carteira inteira"; o travessão diz
    // "há recorte, o nome não veio" — menos errado que o silêncio.
    expect(
      buildReportContextLines({ ...base, hasFactoryFilter: true })
    ).toContain("Fábrica: —");
  });

  it("sem vendedor, afirma que são todos em vez de omitir", () => {
    expect(buildReportContextLines(base)).toContain("Vendedor: todos");
  });

  it("a ordem é período, vendedor, fábrica", () => {
    // O cabeçalho é lido de cima para baixo na conferência; trocar a ordem
    // entre abas faria o leitor procurar o recorte a cada documento.
    const linhas = buildReportContextLines({
      ...base,
      sellerName: "Ana",
      factoryName: "Herc",
      hasFactoryFilter: true,
    });
    expect(linhas.map((l) => l.split(":")[0])).toEqual([
      "Período",
      "Vendedor",
      "Fábrica",
    ]);
  });
});
