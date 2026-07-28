import { describe, expect, it } from "vitest";

import { EntityMonthPoint } from "./interface";
import { pivotEntityMonths } from "./utils";

const row = (
  month: string,
  entityId: string,
  entityName: string,
  total: string
): EntityMonthPoint => ({ month, entityId, entityName, total, orderCount: 1 });

describe("pivotEntityMonths", () => {
  it("monta o eixo com os meses ordenados, sem repetir", () => {
    const { months } = pivotEntityMonths([
      row("2026-03", "a", "Ana", "10"),
      row("2026-01", "b", "Bia", "10"),
      row("2026-03", "b", "Bia", "10"),
    ]);
    expect(months).toEqual(["2026-01", "2026-03"]);
  });

  it("preenche com zero o mês em que a entidade não vendeu", () => {
    // Sem o zero, a linha ligaria jan direto a mar e sugeriria uma
    // continuidade que não houve.
    const { series } = pivotEntityMonths([
      row("2026-01", "a", "Ana", "100"),
      row("2026-02", "b", "Bia", "50"),
      row("2026-03", "a", "Ana", "80"),
    ]);
    const ana = series.find((s) => s.entityId === "a");
    expect(ana?.values).toEqual([100, 0, 80]);
  });

  it("ordena as séries pelo faturamento total do período", () => {
    const { series } = pivotEntityMonths([
      row("2026-01", "a", "Ana", "10"),
      row("2026-01", "b", "Bia", "5"),
      row("2026-02", "b", "Bia", "90"),
    ]);
    // Bia soma 95 contra 10 da Ana: vem primeiro na legenda e ganha a 1ª cor.
    expect(series.map((s) => s.entityName)).toEqual(["Bia", "Ana"]);
  });

  it("todas as séries têm o mesmo comprimento do eixo", () => {
    const { months, series } = pivotEntityMonths([
      row("2026-01", "a", "Ana", "10"),
      row("2026-02", "b", "Bia", "20"),
      row("2026-03", "c", "Cid", "30"),
    ]);
    for (const serie of series) {
      expect(serie.values).toHaveLength(months.length);
    }
  });

  it("agrupa pelo id, não pelo nome", () => {
    // Dois clientes homônimos não podem virar uma linha só.
    const { series } = pivotEntityMonths([
      row("2026-01", "a", "Comercial Silva", "10"),
      row("2026-01", "b", "Comercial Silva", "20"),
    ]);
    expect(series).toHaveLength(2);
  });

  it("sem linhas devolve eixo e séries vazios", () => {
    expect(pivotEntityMonths([])).toEqual({ months: [], series: [] });
  });
});
