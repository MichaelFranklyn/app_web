import { SERIES_BLUE, SERIES_GREEN } from "@/components/Chart/chartTheme";
import type { EChartsCoreOption } from "echarts/core";

import { buildBarLineOption } from "../../chartBuilders";
import { formatPercent, monthKeyToLabel } from "../../utils";
import { RetentionPoint } from "./interface";

/**
 * Clientes ativos no mês (barra) e quantos deles já compravam no mês anterior
 * (linha). É a leitura oposta à de "primeira compra": mostra se a base se
 * sustenta sozinha ou se depende de repor cliente todo mês. O primeiro mês do
 * período sempre marca 0% — não há mês anterior dentro do recorte.
 */
export const buildClientRetentionOption = (
  points: RetentionPoint[]
): EChartsCoreOption =>
  buildBarLineOption(
    points.map((p) => monthKeyToLabel(p.month)),
    {
      name: "Clientes que compraram",
      color: SERIES_BLUE,
      data: points.map((p) => p.activeClients),
      formatter: (v) => String(Math.round(v)),
    },
    {
      name: "Já compravam no mês anterior",
      color: SERIES_GREEN,
      data: points.map((p) => p.retentionRate),
      formatter: formatPercent,
    },
    { lineMax: 1 }
  );
