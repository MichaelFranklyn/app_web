"use client";

import { useLocalTable } from "@/hooks/useLocalTable";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { useQuery } from "@apollo/client/react";
import { useCallback, useMemo } from "react";

import { formatPercent } from "../../utils";
import { ReportFilters, ReportKpi } from "../interface";
import { VISIT_EXECUTION_REPORT_QUERY } from "./gql";
import { ExecutionSellerRow, VisitExecutionResponse } from "./interface";
import {
  EXECUTION_SORT_COLUMNS,
  buildExecutionOption,
  executionTone,
  recordedByPerson,
} from "./utils";

const EMPTY_ROWS: ExecutionSellerRow[] = [];

/**
 * A rotina está sendo executada? Uma linha por vendedor.
 *
 * Existe porque o motor só aprende com visita registrada, e até aqui ninguém no
 * produto enxergava a taxa de execução — o diagnóstico de 13/09/2026 (606
 * planejadas, 4 registradas) saiu de SQL à mão. Os KPIs vêm do fechamento do
 * servidor, não da soma das linhas, pela mesma razão das outras abas de
 * conferência.
 */
export const useExecutionReport = (filters: ReportFilters) => {
  const { data, loading, error, refetch } = useQuery<VisitExecutionResponse>(
    VISIT_EXECUTION_REPORT_QUERY,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        from: filters.from,
        to: filters.to,
        sellerId: filters.sellerId,
      },
    }
  );
  useQueryErrorToast(error, "Não foi possível carregar a execução da rotina.");

  const report = data?.visitAccuracyReport ?? null;
  const allRows = report?.sellers ?? EMPTY_ROWS;

  const table = useLocalTable<ExecutionSellerRow>({
    items: allRows,
    columns: EXECUTION_SORT_COLUMNS,
  });
  const rows = table.displayedData;

  const kpis: ReportKpi[] = useMemo(() => {
    if (!report) return [];
    const recorded = recordedByPerson(report);
    return [
      {
        label: "Execução da rotina",
        value: formatPercent(report.executionRate),
        hint: `${report.worked} de ${report.planned} visita(s) com resposta`,
        status: executionTone(report.executionRate),
      },
      {
        label: "Registradas pelo vendedor",
        value: String(recorded),
        hint: `+ ${report.workedInferred} concluída(s) pelo pedido`,
        status: "neutral",
      },
      {
        label: "Fechadas sem resposta",
        value: String(report.autoClosed),
        hint: `${report.pending} ainda aguardando resposta`,
        status: report.autoClosed > 0 ? "urgente" : "ok",
      },
      {
        label: "Viraram pedido",
        value: String(report.converted),
        hint: `${formatPercent(report.conversionRate)} das planejadas`,
        status: "ok",
      },
    ];
  }, [report]);

  const fetchAllRows = useCallback(
    async (): Promise<ExecutionSellerRow[]> => rows,
    [rows]
  );

  return {
    report,
    kpis,
    kpisLoading: loading && !report,
    chart: {
      option: buildExecutionOption(allRows),
      hasData: allRows.length > 0,
      loading,
      error,
      refetch: () => void refetch(),
    },
    sort: table.sort,
    rows,
    loading,
    fetchAllRows,
    hasRows: rows.length > 0,
  };
};
