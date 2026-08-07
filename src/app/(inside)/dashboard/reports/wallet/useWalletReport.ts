"use client";

import { useLocalTable } from "@/hooks/useLocalTable";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { formatMoney } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";
import { useCallback, useMemo } from "react";

import { formatPercent } from "../../utils";
import { ReportFilters, ReportKpi } from "../interface";
import { useLocalReportPage } from "../useLocalReportPage";
import { safeRate } from "../utils";
import { WALLET_STATUS_REPORT_QUERY } from "./gql";
import { WalletReportResponse, WalletRow } from "./interface";
import { WALLET_FILTER_FIELDS, useWalletFilters } from "./useWalletFilters";
import { buildSituationOption, WALLET_SORT_COLUMNS } from "./utils";

export const WALLET_PER_PAGE = 25;

const EMPTY_REPORT = {
  rows: [] as WalletRow[],
  totalClients: 0,
  activeClients: 0,
  atRiskClients: 0,
  inactiveClients: 0,
  neverBoughtClients: 0,
  newClients: 0,
  periodAmount: "0",
};

/**
 * A situação da carteira: cada cliente medido contra o PRÓPRIO ritmo de compra.
 *
 * A situação é um retrato de HOJE e não muda com o período escolhido — quem
 * está parado há seis meses continua parado quando se olha para a semana
 * passada. O período governa só as colunas "no período", que dizem quanto o
 * cliente comprou dentro do recorte.
 *
 * Os KPIs saem do fechamento do servidor (a carteira inteira), não do recorte
 * à vista: filtrar por "atrasados" muda a tabela, e o topo tem de continuar
 * dizendo de que tamanho é a carteira.
 *
 * Filtro, ordenação e paginação são locais (o relatório vem inteiro), e é a
 * lista JÁ filtrada e ordenada que vai para o XLSX/PDF.
 */
export const useWalletReport = (filters: ReportFilters) => {
  const { data, loading, error, refetch } = useQuery<WalletReportResponse>(
    WALLET_STATUS_REPORT_QUERY,
    {
      variables: {
        from: filters.from,
        to: filters.to,
        sellerId: filters.sellerId,
      },
    }
  );
  useQueryErrorToast(error, "Não foi possível carregar a carteira.");

  const report = data?.walletStatusReport ?? EMPTY_REPORT;

  const table = useLocalTable<WalletRow>({
    items: report.rows,
    columns: WALLET_SORT_COLUMNS,
    fields: WALLET_FILTER_FIELDS,
  });

  const filterFields = useWalletFilters(report.rows);
  const rows = table.displayedData;

  const { currentPage, setCurrentPage, totalPages, pageRows } =
    useLocalReportPage(rows, WALLET_PER_PAGE);

  const kpis: ReportKpi[] = useMemo(() => {
    const needAttention = report.atRiskClients + report.inactiveClients;
    return [
      {
        label: "Clientes na carteira",
        value: String(report.totalClients),
        hint: `${report.newClients} novo(s) · ${report.neverBoughtClients} sem nenhuma compra`,
        status: "neutral",
      },
      {
        label: "Em dia",
        value: String(report.activeClients),
        hint:
          report.totalClients > 0
            ? `${formatPercent(safeRate(report.activeClients, report.totalClients))} da carteira`
            : "carteira vazia",
        status: "ok",
      },
      {
        // Atrasado e parado juntos: é a fila de trabalho do vendedor, e separá-la
        // em dois cartões esconderia o tamanho do problema.
        label: "Precisam de contato",
        value: String(needAttention),
        hint: `${report.atRiskClients} atrasado(s) · ${report.inactiveClients} parado(s)`,
        status: needAttention > 0 ? "urgente" : "ok",
      },
      {
        label: "Comprado no período",
        value: formatMoney(report.periodAmount),
        hint: "pela data do pedido, orçamento fora",
        status: "atencao",
      },
    ];
  }, [report]);

  const fetchAllRows = useCallback(
    async (): Promise<WalletRow[]> => rows,
    [rows]
  );

  return {
    report,
    kpis,
    kpisLoading: loading && report.rows.length === 0,
    chart: {
      option: buildSituationOption(report),
      hasData: report.totalClients > 0,
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
    currentPage,
    setCurrentPage,
    totalPages,
    loading,
    fetchAllRows,
    hasRows: rows.length > 0,
  };
};
