import {
  CHART_PALETTE,
  SERIES_ORANGE,
  SERIES_RED,
} from "@/components/Chart/chartTheme";
import { formatMoney } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import {
  buildHorizontalBarOption,
  mutedLine,
} from "../../../../../chartBuilders";
import { formatCount } from "../../../../utils";
import { ScopedCommissionRow } from "../../interface";

/** Mostarda da paleta: primeira faixa de atraso, a menos grave. */
const SERIES_MUSTARD = CHART_PALETTE[6];

export interface OverdueFactory {
  factoryId: string;
  name: string;
  /** Até 30 dias de atraso. */
  upTo30: number;
  /** De 31 a 90 dias. */
  upTo90: number;
  /** Mais de 90 dias. */
  over90: number;
  total: number;
  count: number;
}

/** Dias corridos entre duas datas ISO ("2026-08-01"), sem hora nem fuso. */
const daysBetween = (from: string, to: string): number => {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  return Math.round((end - start) / 86_400_000);
};

/**
 * O que está A RECEBER com a data de pagamento já vencida, por fábrica e por
 * tempo de atraso.
 *
 * Só entra `receivable`: previsto ainda depende do cliente pagar o boleto, e
 * recebido já entrou. O atraso é contado da data em que a comissão deveria cair
 * até hoje — é a conversa que o representante vai ter com a fábrica.
 *
 * Três faixas (e não seis) porque a decisão é a mesma dentro de cada uma:
 * cobrar na próxima ligação, cobrar agora, ou revisar o de-para da planilha.
 */
export const overdueByFactory = (
  rows: ScopedCommissionRow[],
  today: string,
  limit = 8
): OverdueFactory[] => {
  const byFactory = new Map<string, OverdueFactory>();

  for (const row of rows) {
    if (row.status !== "receivable") continue;
    const late = daysBetween(row.date, today);
    if (late <= 0) continue; // ainda no prazo

    const factory = byFactory.get(row.factoryId) ?? {
      factoryId: row.factoryId,
      name: row.factoryName,
      upTo30: 0,
      upTo90: 0,
      over90: 0,
      total: 0,
      count: 0,
    };

    if (late <= 30) factory.upTo30 += row.amount;
    else if (late <= 90) factory.upTo90 += row.amount;
    else factory.over90 += row.amount;

    factory.total += row.amount;
    factory.count += 1;
    byFactory.set(row.factoryId, factory);
  }

  return [...byFactory.values()]
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
};

/**
 * Uma barra por fábrica, dividida pelo tempo de atraso — quanto mais vermelho,
 * mais antigo o dinheiro parado. Empilhada porque a barra inteira é a dívida da
 * fábrica com o representante, e as cores dizem há quanto tempo ela existe.
 */
export const buildCommissionOverdueOption = (
  factories: OverdueFactory[]
): EChartsCoreOption =>
  buildHorizontalBarOption(
    factories.map((factory) => factory.name),
    [
      {
        name: "Até 30 dias",
        color: SERIES_MUSTARD,
        data: factories.map((factory) => factory.upTo30),
      },
      {
        name: "31 a 90 dias",
        color: SERIES_ORANGE,
        data: factories.map((factory) => factory.upTo90),
      },
      {
        name: "Mais de 90 dias",
        color: SERIES_RED,
        data: factories.map((factory) => factory.over90),
      },
    ],
    formatMoney,
    (index) => {
      const factory = factories[index];
      if (!factory) return [];
      return [
        factory.name,
        `Atrasado: <b>${formatMoney(factory.total)}</b>`,
        mutedLine(formatCount(factory.count, "parcela", "parcelas")),
        mutedLine(
          `Até 30 dias: ${formatMoney(factory.upTo30)} · 31 a 90: ${formatMoney(factory.upTo90)} · +90: ${formatMoney(factory.over90)}`
        ),
      ];
    },
    { stacked: true }
  );
