"use client";

import { useLocalTable } from "@/hooks/useLocalTable";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { formatMoney } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";
import { useCallback, useMemo } from "react";

import { formatPercent } from "../../utils";
import { ReportFilters, ReportKpi } from "../interface";
import { useLocalReportPage } from "../useLocalReportPage";
import { POSITIVATION_REPORT_QUERY } from "./gql";
import { PositivationReportResponse, PositivationRow } from "./interface";
import {
  POSITIVATION_FILTER_FIELDS,
  usePositivationFilters,
} from "./usePositivationFilters";
import {
  POSITIVATION_SORT_COLUMNS,
  buildFactoryRateOption,
  summarizeRows,
} from "./utils";

export const POSITIVATION_PER_PAGE = 25;

const EMPTY_REPORT = {
  walletClients: 0,
  positivatedClients: 0,
  clientPositivationRate: 0,
  linkedPairs: 0,
  positivatedPairs: 0,
  pairPositivationRate: 0,
  totalAmount: "0",
  factories: [],
  rows: [],
};

/**
 * Os dados da matriz de positivação.
 *
 * O backend devolve o relatório inteiro (sem top-N: esconder linhas seria esconder
 * quem não comprou, que é o assunto), então filtro, ordenação e paginação são
 * locais e moram na URL junto do período — o link leva ao mesmo recorte. É a
 * lista JÁ filtrada e ordenada que vai para o XLSX/PDF.
 */
export const usePositivationReport = (filters: ReportFilters) => {
  const { data, loading, error, refetch } =
    useQuery<PositivationReportResponse>(POSITIVATION_REPORT_QUERY, {
      variables: {
        from: filters.from,
        to: filters.to,
        sellerId: filters.sellerId,
      },
    });
  useQueryErrorToast(error, "Não foi possível carregar a positivação.");

  const report = data?.positivationReport ?? EMPTY_REPORT;

  const table = useLocalTable<PositivationRow>({
    items: report.rows,
    columns: POSITIVATION_SORT_COLUMNS,
    fields: POSITIVATION_FILTER_FIELDS,
  });

  const filterFields = usePositivationFilters(report.rows, report.factories);
  const rows = table.displayedData;

  const { currentPage, setCurrentPage, totalPages, pageRows } =
    useLocalReportPage(rows, POSITIVATION_PER_PAGE);

  const kpis: ReportKpi[] = useMemo(() => {
    const zeroed = report.walletClients - report.positivatedClients;
    return [
      {
        label: "Positivação da carteira",
        value: formatPercent(report.clientPositivationRate),
        hint: `${report.positivatedClients} de ${report.walletClients} cliente(s)`,
        status: report.clientPositivationRate >= 0.5 ? "ok" : "atencao",
      },
      {
        // A taxa que revela o cliente fiel a uma fábrica e fechado nas outras.
        label: "Positivação por fábrica",
        value: formatPercent(report.pairPositivationRate),
        hint: `${report.positivatedPairs} de ${report.linkedPairs} vínculo(s)`,
        status: "neutral",
      },
      {
        label: "Clientes zerados",
        value: String(zeroed),
        hint: "não compraram nada no período",
        status: zeroed > 0 ? "urgente" : "ok",
      },
      {
        label: "Valor no período",
        value: formatMoney(report.totalAmount),
        hint: "compras da carteira nas fábricas vinculadas",
        status: "neutral",
      },
    ];
  }, [report]);

  const fetchAllRows = useCallback(
    async (): Promise<PositivationRow[]> => rows,
    [rows]
  );

  return {
    report,
    kpis,
    kpisLoading: loading && report.rows.length === 0,
    chart: {
      option: buildFactoryRateOption(report.factories),
      hasData: report.factories.length > 0,
      loading,
      error,
      refetch: () => void refetch(),
    },
    filterFields,
    inputValues: table.inputValues,
    setFilter: table.setFilter,
    setFilters: table.setFilters,
    sort: table.sort,
    rows,
    pageRows,
    totals: summarizeRows(rows),
    currentPage,
    setCurrentPage,
    totalPages,
    loading,
    fetchAllRows,
    hasRows: rows.length > 0,
  };
};
