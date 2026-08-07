import { orderStatusLabel } from "@/app/(inside)/_shared/orderStatus";
import { SelectOption } from "@/components/Input";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { SortLabel } from "@/utils/pdf/context";
import type { EChartsCoreOption } from "echarts/core";

import { buildStackedBarOption, mutedLine } from "../../chartBuilders";
import { formatDays } from "../../utils";
import {
  ClientSituation,
  SITUATION_LABEL,
  SITUATION_ORDER,
  SITUATION_SERIES_COLOR,
} from "../situation";
import { PurchaseRow } from "./interface";

/**
 * As fábricas que aparecem nas PRÓPRIAS linhas, em ordem alfabética.
 *
 * Tiradas do relatório, e não de uma consulta à parte: o seletor do painel de
 * filtros não oferece uma fábrica que devolveria a tabela vazia.
 */
export const factoryOptions = (rows: PurchaseRow[]): SelectOption[] => {
  const seen = new Map<string, string>();
  rows.forEach((row) => {
    if (!seen.has(row.factoryId)) seen.set(row.factoryId, row.factoryName);
  });
  return [...seen.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
};

export const sumBy = (
  rows: PurchaseRow[],
  pick: (row: PurchaseRow) => string | number
): number => rows.reduce((total, row) => total + Number(pick(row) || 0), 0);

export const cityAndState = (row: PurchaseRow): string =>
  [row.city, row.state].filter(Boolean).join(" / ") || "—";

/** "há 18 dias" / "nunca comprou desta fábrica" — a coluna do tempo parado. */
export const idleLabel = (row: PurchaseRow): string =>
  row.daysSinceLastOrder === null
    ? "nunca comprou desta fábrica"
    : `há ${formatDays(row.daysSinceLastOrder)}`;

/**
 * O ritmo do par escrito por extenso. Sem segunda compra não há intervalo
 * próprio, e inventar um ("30 dias") faria a coluna mentir.
 */
export const cadenceLabel = (row: PurchaseRow): string =>
  row.avgIntervalDays ? `a cada ${formatDays(row.avgIntervalDays)}` : "—";

/** "1,8×" — o quanto o par passou do que costuma levar entre compras. */
export const riskLabel = (row: PurchaseRow): string =>
  row.riskRatio === null ? "—" : `${row.riskRatio.toFixed(1)}×`;

/**
 * O número do pedido: o prefixo do id, os mesmos 8 caracteres que a tela do
 * pedido e o PDF dele mostram — é por ele que se acha a compra depois.
 */
export const orderNumber = (row: PurchaseRow): string =>
  row.lastOrderId ? row.lastOrderId.slice(0, 8).toUpperCase() : "—";

/** A data da última compra, ou o motivo de não haver uma. */
export const lastPurchaseLabel = (row: PurchaseRow): string =>
  row.lastOrderDate ? formatDateDMY(row.lastOrderDate) : "nunca";

/**
 * Para onde a linha leva.
 *
 * O assunto da linha é a COMPRA, então o clique abre o pedido — é lá que está o
 * que o cliente levou naquela fábrica, que é a pergunta seguinte de quem lê
 * "comprou em 30/07". Sem compra nenhuma não há pedido para abrir, e aí o
 * destino útil é o cliente.
 */
export const rowHref = (row: PurchaseRow): string =>
  row.lastOrderId
    ? `/orders/${row.lastOrderId}`
    : `/clients/${row.companyClientId}`;

/**
 * Colunas ordenáveis da tabela e como elas se chamam no papel.
 *
 * A ordenação é local (o relatório vem inteiro), e é ela que responde às
 * perguntas de trabalho: "quem está parado há mais tempo nesta fábrica" é a
 * coluna do tempo parado em ordem decrescente.
 */
export const PURCHASE_SORT_COLUMNS = {
  client: (row: PurchaseRow) => row.clientName,
  factory: (row: PurchaseRow) => row.factoryName,
  lastOrderDate: (row: PurchaseRow) => row.lastOrderDate,
  lastOrderAmount: (row: PurchaseRow) => Number(row.lastOrderAmount || 0),
  idle: (row: PurchaseRow) => row.daysSinceLastOrder,
  cadence: (row: PurchaseRow) => row.avgIntervalDays,
  periodAmount: (row: PurchaseRow) => Number(row.periodAmount || 0),
};

export const PURCHASE_SORT_LABELS: Record<string, SortLabel> = {
  client: { label: "Cliente", kind: "text" },
  factory: { label: "Fábrica", kind: "text" },
  lastOrderDate: { label: "Última compra", kind: "date" },
  lastOrderAmount: { label: "Valor da última", kind: "number" },
  idle: { label: "Parado há", kind: "number" },
  cadence: { label: "Ritmo", kind: "number" },
  periodAmount: { label: "No período", kind: "number" },
};

/**
 * Como cada fábrica está sendo atendida: uma barra por fábrica, repartida entre
 * as situações dos clientes vinculados a ela.
 *
 * Empilhada, e não uma barra por situação, porque a leitura é a comparação entre
 * FÁBRICAS — a fábrica cuja barra é quase toda vermelha e cinza tem uma carteira
 * inteira parada, e é essa a conversa da próxima reunião com ela.
 */
export const buildFactorySituationOption = (
  rows: PurchaseRow[]
): EChartsCoreOption => {
  const byFactory = new Map<string, Record<ClientSituation, number>>();
  rows.forEach((row) => {
    const current =
      byFactory.get(row.factoryName) ??
      ({ ACTIVE: 0, AT_RISK: 0, INACTIVE: 0, NEW: 0, NEVER: 0 } as Record<
        ClientSituation,
        number
      >);
    current[row.situation] += 1;
    byFactory.set(row.factoryName, current);
  });

  // Da fábrica com mais clientes para a com menos: as barras altas primeiro dão
  // a escala do gráfico antes das que quase não têm carteira.
  const factories = [...byFactory.entries()].sort(
    (a, b) => totalOf(b[1]) - totalOf(a[1])
  );

  return buildStackedBarOption(
    factories.map(([name]) => name),
    SITUATION_ORDER.map((situation) => ({
      name: SITUATION_LABEL[situation],
      color: SITUATION_SERIES_COLOR[situation],
      data: factories.map(([, counts]) => counts[situation]),
    })),
    (value) => String(Math.round(value)),
    (index) => {
      const entry = factories[index];
      if (!entry) return [];
      const [name, counts] = entry;
      const total = totalOf(counts);
      return [
        `<b>${name}</b>`,
        `${total} cliente(s) vinculado(s)`,
        ...SITUATION_ORDER.filter((situation) => counts[situation] > 0).map(
          (situation) => `${SITUATION_LABEL[situation]}: ${counts[situation]}`
        ),
        mutedLine("a situação é medida pelo ritmo de compra nesta fábrica"),
      ];
    }
  );
};

const totalOf = (counts: Record<ClientSituation, number>): number =>
  SITUATION_ORDER.reduce((total, situation) => total + counts[situation], 0);

export const PURCHASES_EXPORT_HEADERS = [
  "Cliente",
  "Cidade/UF",
  "Fábrica",
  "Vendedor",
  "Situação",
  "Última compra",
  "Pedido",
  "Valor da última compra",
  "Situação do pedido",
  "Faturado em",
  "Dias sem comprar",
  "Ritmo (dias)",
  "Atraso sobre o ritmo",
  "Compras (total)",
  "Valor comprado (total)",
  "Compras no período",
  "Valor no período",
  "Vínculo ativo",
];

export const buildPurchasesExportRows = (
  rows: PurchaseRow[]
): (string | number)[][] =>
  rows.map((row) => [
    row.clientName,
    cityAndState(row),
    row.factoryName,
    row.sellerName ?? "—",
    SITUATION_LABEL[row.situation],
    row.lastOrderDate ? formatDateDMY(row.lastOrderDate) : "nunca comprou",
    orderNumber(row),
    Number(row.lastOrderAmount || 0),
    row.lastOrderStatus ? orderStatusLabel(row.lastOrderStatus) : "—",
    row.lastInvoicedAt ? formatDateDMY(row.lastInvoicedAt) : "—",
    row.daysSinceLastOrder ?? "—",
    row.avgIntervalDays ? Math.round(row.avgIntervalDays) : "—",
    riskLabel(row),
    row.orderCount,
    Number(row.historyAmount || 0),
    row.periodOrderCount,
    Number(row.periodAmount || 0),
    row.isLinked ? "Sim" : "Não",
  ]);

/** Fechamento do recorte exportado, para o PDF fechar com o que está nele. */
export const summarize = (rows: PurchaseRow[]) => ({
  pairs: rows.length,
  clients: new Set(rows.map((row) => row.clientId)).size,
  factories: new Set(rows.map((row) => row.factoryId)).size,
  never: rows.filter((row) => row.situation === "NEVER").length,
  atRisk: rows.filter((row) => row.situation === "AT_RISK").length,
  inactive: rows.filter((row) => row.situation === "INACTIVE").length,
  periodAmount: formatMoney(sumBy(rows, (row) => row.periodAmount)),
});
