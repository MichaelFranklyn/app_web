import {
  SERIES_CYAN,
  SERIES_GREEN,
  SERIES_ORANGE,
  SERIES_RED,
} from "@/components/Chart/chartTheme";
import { SortLabel } from "@/utils/pdf/context";
import type { EChartsCoreOption } from "echarts/core";

import { buildHorizontalBarOption, mutedLine } from "../../chartBuilders";
import { formatPercent } from "../../utils";
import { ExecutionSellerRow } from "./interface";

/**
 * A régua que decide se o lift do motor pode ser lido. Espelha
 * `MIN_EXECUTION_FOR_LIFT` do backend (`reports/visit_accuracy.py`) — só para
 * o texto da tela; quem decide é o `isLiftReliable` que vem do servidor.
 */
export const MIN_EXECUTION_FOR_LIFT = 0.3;

/** Registradas por alguém: o que foi respondido menos o que o pedido provou. */
export const recordedByPerson = (row: {
  worked: number;
  workedInferred: number;
}): number => Math.max(row.worked - row.workedInferred, 0);

/**
 * Tom da taxa de execução: abaixo de 30% o motor não pode ser julgado, entre
 * 30% e 60% a rotina anda pela metade, acima disso está sendo seguida.
 */
export const executionTone = (rate: number): "urgente" | "atencao" | "ok" =>
  rate < MIN_EXECUTION_FOR_LIFT ? "urgente" : rate < 0.6 ? "atencao" : "ok";

/**
 * O destino de cada visita planejada, por vendedor, EMPILHADO: as quatro partes
 * somam o planejado (diferente do gráfico das fábricas, aqui cada fatia é uma
 * visita que só pode estar num lugar). A barra vermelha comprida é a leitura —
 * visita que ninguém respondeu e o sistema teve de fechar.
 */
export const buildExecutionOption = (
  rows: ExecutionSellerRow[]
): EChartsCoreOption =>
  buildHorizontalBarOption(
    rows.map((row) => row.sellerName),
    [
      {
        name: "Registradas",
        color: SERIES_GREEN,
        data: rows.map(recordedByPerson),
      },
      {
        name: "Pelo pedido",
        color: SERIES_CYAN,
        data: rows.map((row) => row.workedInferred),
      },
      {
        name: "Aguardando resposta",
        color: SERIES_ORANGE,
        data: rows.map((row) => row.pending),
      },
      {
        name: "Fechadas sem resposta",
        color: SERIES_RED,
        data: rows.map((row) => row.autoClosed),
      },
    ],
    (value) => String(Math.round(value)),
    (index) => {
      const row = rows[index];
      if (!row) return [];
      return [
        row.sellerName,
        `Execução: <b>${formatPercent(row.executionRate)}</b> de ${row.planned} planejada(s)`,
        `Registradas: ${recordedByPerson(row)} · pelo pedido: ${row.workedInferred}`,
        `Aguardando resposta: ${row.pending}`,
        `Fechadas sem resposta: ${row.autoClosed}`,
        mutedLine(`${row.converted} viraram pedido`),
      ];
    },
    { stacked: true }
  );

export const EXECUTION_SORT_COLUMNS = {
  seller: (row: ExecutionSellerRow) => row.sellerName,
  planned: (row: ExecutionSellerRow) => row.planned,
  executionRate: (row: ExecutionSellerRow) => row.executionRate,
  recorded: (row: ExecutionSellerRow) => recordedByPerson(row),
  workedInferred: (row: ExecutionSellerRow) => row.workedInferred,
  pending: (row: ExecutionSellerRow) => row.pending,
  autoClosed: (row: ExecutionSellerRow) => row.autoClosed,
  converted: (row: ExecutionSellerRow) => row.converted,
};

export const EXECUTION_SORT_LABELS: Record<string, SortLabel> = {
  seller: { label: "Vendedor", kind: "text" },
  planned: { label: "Planejadas", kind: "number" },
  executionRate: { label: "Execução", kind: "number" },
  recorded: { label: "Registradas", kind: "number" },
  workedInferred: { label: "Pelo pedido", kind: "number" },
  pending: { label: "Aguardando", kind: "number" },
  autoClosed: { label: "Fechadas sem resposta", kind: "number" },
  converted: { label: "Viraram pedido", kind: "number" },
};

export const EXECUTION_EXPORT_HEADERS = [
  "Vendedor",
  "Planejadas",
  "Execução",
  "Registradas",
  "Pelo pedido",
  "Aguardando resposta",
  "Fechadas sem resposta",
  "Viraram pedido",
];

export const buildExecutionExportRows = (
  rows: ExecutionSellerRow[]
): (string | number)[][] =>
  rows.map((row) => [
    row.sellerName,
    row.planned,
    formatPercent(row.executionRate),
    recordedByPerson(row),
    row.workedInferred,
    row.pending,
    row.autoClosed,
    row.converted,
  ]);
