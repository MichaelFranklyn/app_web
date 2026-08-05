import { CHART_PALETTE } from "@/components/Chart/chartTheme";
import { formatMoney } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import { buildMonthLinesOption } from "../../../chartBuilders";
import { monthKeyToLabel } from "../../utils";
import {
  EntityMonthPoint,
  EntityMonthValueKey,
  PivotedSeries,
} from "./interface";

/**
 * Vira as linhas (mês, entidade) em séries contínuas.
 *
 * O eixo passa a ter TODOS os meses presentes na resposta, e cada entidade
 * recebe um valor para cada um deles — zero nos meses em que não vendeu. Sem
 * esse preenchimento a linha "pularia" o mês vazio e ligaria dois meses não
 * adjacentes, sugerindo uma continuidade que não existiu.
 */
export const pivotEntityMonths = (
  rows: EntityMonthPoint[],
  valueKey: EntityMonthValueKey = "total"
): PivotedSeries => {
  const months = [...new Set(rows.map((r) => r.month))].sort();
  const monthIndex = new Map(months.map((m, index) => [m, index]));

  const byEntity = new Map<string, { name: string; values: number[] }>();
  for (const row of rows) {
    const entry = byEntity.get(row.entityId) ?? {
      name: row.entityName,
      values: Array(months.length).fill(0),
    };
    entry.values[monthIndex.get(row.month) ?? 0] = Number(row[valueKey]) || 0;
    byEntity.set(row.entityId, entry);
  }

  // Maior faturamento no período primeiro: a ordem da legenda passa a ser a
  // ordem de importância, e as cores ficam estáveis entre recargas.
  const series = [...byEntity.entries()]
    .map(([entityId, entry]) => ({
      entityId,
      entityName: entry.name,
      values: entry.values,
    }))
    .sort(
      (a, b) =>
        b.values.reduce((sum, v) => sum + v, 0) -
        a.values.reduce((sum, v) => sum + v, 0)
    );

  return { months, series };
};

/**
 * Uma linha por entidade ao longo dos meses. É o gráfico que responde "quem
 * está subindo e quem está caindo" — o ranking do período inteiro esconde
 * exatamente isso.
 *
 * O formatador decide a grandeza da série: dinheiro (faturamento, o padrão) ou
 * contagem (nº de pedidos), que é a mesma leitura em outra unidade.
 */
export const buildEntityMonthSeriesOption = (
  { months, series }: PivotedSeries,
  valueFormatter: (v: number) => string = formatMoney
): EChartsCoreOption =>
  buildMonthLinesOption(
    months.map(monthKeyToLabel),
    series.map((serie, index) => ({
      name: serie.entityName,
      color: CHART_PALETTE[index % CHART_PALETTE.length],
      data: serie.values,
    })),
    valueFormatter
  );
