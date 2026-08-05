import { SERIES_CYAN, SERIES_ORANGE } from "@/components/Chart/chartTheme";
import type { EChartsCoreOption } from "echarts/core";

import { buildBarLineOption } from "../../../chartBuilders";
import { formatPercent, monthKeyToLabel } from "../../utils";
import { VisitConversionPoint } from "./interface";

/**
 * Visitas realizadas no mês (barra) e a fatia delas que virou pedido (linha).
 * Duas leituras num gráfico só: a barra mostra o esforço, a linha mostra o
 * rendimento. Muita visita com linha baixa é roteiro ruim, não falta de
 * trabalho.
 */
export const buildVisitConversionOption = (
  points: VisitConversionPoint[]
): EChartsCoreOption =>
  buildBarLineOption(
    points.map((p) => monthKeyToLabel(p.month)),
    {
      name: "Visitas realizadas",
      color: SERIES_CYAN,
      data: points.map((p) => p.visits),
      formatter: (v) => String(Math.round(v)),
    },
    {
      name: "Viraram pedido",
      color: SERIES_ORANGE,
      data: points.map((p) => p.conversionRate),
      formatter: formatPercent,
    },
    { lineMax: 1 }
  );
