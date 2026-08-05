import {
  SERIES_BLUE,
  SERIES_CYAN,
  SERIES_GREEN,
  SERIES_RED,
} from "@/components/Chart/chartTheme";
import { CHART_INK_MUTED } from "@/components/Chart/chartTheme";
import type { EChartsCoreOption } from "echarts/core";

import { buildStackedBarOption } from "../../../chartBuilders";
import { monthKeyToLabel } from "../../utils";
import { OrderStatusByMonthPoint } from "./interface";

// Ordem da pilha = ordem do fluxo do pedido, de baixo para cima: orçamento →
// confirmado → faturado → entregue. Cancelado fecha por cima, em vermelho, para
// saltar aos olhos sem se confundir com as etapas saudáveis.
const STATUS_SERIES = [
  { name: "Orçamento", color: CHART_INK_MUTED, key: "quotes" },
  { name: "Confirmado", color: SERIES_CYAN, key: "confirmed" },
  { name: "Faturado", color: SERIES_BLUE, key: "invoiced" },
  { name: "Entregue", color: SERIES_GREEN, key: "delivered" },
  { name: "Cancelado", color: SERIES_RED, key: "cancelled" },
] as const;

/**
 * Situação atual dos pedidos de cada mês. O pedido conta no mês em que foi
 * feito, com o status de hoje — é assim que dá para ver um mês que pareceu
 * bom na hora e depois virou cancelamento ou encalhou em orçamento.
 */
export const buildOrderStatusByMonthOption = (
  points: OrderStatusByMonthPoint[]
): EChartsCoreOption =>
  buildStackedBarOption(
    points.map((p) => monthKeyToLabel(p.month)),
    STATUS_SERIES.map((serie) => ({
      name: serie.name,
      color: serie.color,
      data: points.map((p) => p[serie.key]),
    }))
  );
