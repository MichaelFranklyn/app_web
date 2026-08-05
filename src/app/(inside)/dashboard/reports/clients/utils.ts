import { SERIES_ORANGE, SERIES_RED } from "@/components/Chart/chartTheme";
import type { QueryFilter } from "@/hooks/useTableData";
import { formatDateDMY, maskCNPJ } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import { buildHorizontalBarOption, mutedLine } from "../../chartBuilders";
import { formatDays } from "../../utils";
import { ClientReportRow, ClientRiskPoint } from "./interface";

/**
 * O recorte da carteira. Só o vendedor entra: a carteira é um retrato de HOJE
 * (quem está cadastrado, quando comprou pela última vez), não um intervalo — o
 * período do filtro governa o gráfico de atraso, que é o que depende dele.
 */
export const buildClientsFilters = (sellerId: string | null): QueryFilter[] =>
  sellerId ? [{ field: "seller_id", operator: "eq", value: sellerId }] : [];

/** Dias desde a última compra; `null` quando o cliente nunca comprou. */
export const daysSinceOrder = (
  lastOrderDate: string | null | undefined,
  today: Date = new Date()
): number | null => {
  if (!lastOrderDate) return null;
  const [year, month, day] = lastOrderDate.split("-").map(Number);
  const last = Date.UTC(year, (month ?? 1) - 1, day ?? 1);
  const now = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate()
  );
  return Math.max(0, Math.round((now - last) / 86_400_000));
};

/** "18 dias" / "nunca comprou" — o texto da coluna de tempo parado. */
export const idleLabel = (lastOrderDate: string | null | undefined): string => {
  const days = daysSinceOrder(lastOrderDate);
  return days === null ? "nunca comprou" : formatDays(days);
};

export const sellerNames = (row: ClientReportRow): string =>
  row.companyClient?.sellers.map((seller) => seller.name).join(", ") || "—";

export const cityAndState = (row: ClientReportRow): string =>
  [row.addressCity, row.addressState].filter(Boolean).join(" / ") || "—";

export const scoreLabel = (row: ClientReportRow): string => {
  const total = row.companyClient?.visitScoreTotal;
  return total ? Number(total).toFixed(0) : "—";
};

/**
 * Clientes mais atrasados para voltar, comparados ao PRÓPRIO ritmo.
 *
 * A barra é a razão (dias parados ÷ intervalo médio do cliente): quem compra a
 * cada 20 dias e sumiu há 60 está pior do que quem compra a cada 90 e sumiu há
 * 100. Vermelho passou do dobro do próprio ciclo — é a fila de visita.
 */
export const buildAtRiskOption = (
  points: ClientRiskPoint[]
): EChartsCoreOption =>
  buildHorizontalBarOption(
    points.map((point) => point.entityName),
    [
      {
        name: "Atraso sobre o próprio ritmo",
        color: SERIES_ORANGE,
        data: points.map((point) => point.riskRatio),
        itemColors: points.map((point) =>
          point.riskRatio >= 2 ? SERIES_RED : SERIES_ORANGE
        ),
      },
    ],
    (value) => `${value.toFixed(1)}×`,
    (index) => {
      const point = points[index];
      if (!point) return [];
      return [
        point.entityName,
        `Parado há <b>${formatDays(point.daysSinceLastOrder)}</b>`,
        `Costuma comprar a cada ${formatDays(point.avgIntervalDays)}`,
        mutedLine(
          `${point.riskRatio.toFixed(1)}× o próprio ciclo · última compra ${formatDateDMY(point.lastOrderDate)}`
        ),
      ];
    }
  );

export const CLIENTS_EXPORT_HEADERS = [
  "Cliente",
  "Nome fantasia",
  "CNPJ",
  "Cidade / UF",
  "Rede",
  "Segmento",
  "Vendedor",
  "Última compra",
  "Dias sem comprar",
  "Última visita",
  "Score",
];

export const buildClientsExportRows = (
  rows: ClientReportRow[]
): (string | number)[][] =>
  rows.map((row) => {
    const days = daysSinceOrder(row.companyClient?.lastOrderDate);
    return [
      row.razaoSocial,
      row.nomeFantasia ?? "—",
      maskCNPJ(row.cnpj),
      cityAndState(row),
      row.companyClient?.network?.name ?? "—",
      row.companyClient?.segment?.name ?? "—",
      sellerNames(row),
      row.companyClient?.lastOrderDate
        ? formatDateDMY(row.companyClient.lastOrderDate)
        : "nunca comprou",
      // Número, não texto: é a coluna pela qual se ordena a planilha para achar
      // quem sumiu. Sem compra fica vazio — zero mentiria ("comprou hoje").
      days === null ? "" : days,
      row.companyClient?.lastVisitDate
        ? formatDateDMY(row.companyClient.lastVisitDate)
        : "—",
      scoreLabel(row),
    ];
  });
