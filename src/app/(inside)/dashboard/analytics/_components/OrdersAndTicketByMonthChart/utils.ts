import { SERIES_BLUE, SERIES_ORANGE } from "@/components/Chart/chartTheme";
import { formatMoney, formatNumber } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import { buildBarLineOption } from "../../../chartBuilders";
import { monthKeyToLabel } from "../../utils";
import { OrdersAndTicketPoint, OrdersAndTicketResponse } from "./interface";

/**
 * Normaliza a agregação mensal nos pontos do desenho.
 *
 * Reordena por mês em vez de confiar na ordem do backend: a leitura do gráfico
 * (subiu/desceu) depende do eixo estar em ordem cronológica, e uma agregação
 * fora de ordem inverteria a conclusão sem deixar o desenho estranho.
 */
export const toOrdersAndTicketPoints = (
  data?: OrdersAndTicketResponse
): OrdersAndTicketPoint[] =>
  (data?.avgTicketByMonth ?? [])
    .map((row) => ({
      month: row.month,
      orderCount: row.orderCount,
      avgTicket: Number(row.avgTicket) || 0,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

/**
 * Barra (quantos pedidos) + linha (valor médio do pedido) no mesmo mês.
 *
 * É o gráfico que separa as duas formas de crescer: barra subindo com linha
 * parada = mais vendas do mesmo tamanho; barra parada com linha subindo = as
 * mesmas vendas, maiores. Faturamento sozinho não distingue as duas, e é a
 * distinção que decide onde trabalhar — prospecção ou mix.
 */
export const buildOrdersAndTicketOption = (
  points: OrdersAndTicketPoint[]
): EChartsCoreOption =>
  buildBarLineOption(
    points.map((point) => monthKeyToLabel(point.month)),
    {
      name: "Pedidos",
      color: SERIES_BLUE,
      data: points.map((point) => point.orderCount),
      formatter: formatNumber,
    },
    {
      name: "Ticket médio",
      color: SERIES_ORANGE,
      data: points.map((point) => point.avgTicket),
      formatter: formatMoney,
    }
  );
