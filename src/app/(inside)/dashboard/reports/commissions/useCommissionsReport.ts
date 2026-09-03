"use client";

import { useLocalTable } from "@/hooks/useLocalTable";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { formatMoney } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";
import { useCallback, useMemo } from "react";

import { ReportFilters, ReportKpi } from "../interface";
import { useLocalReportPage } from "../useLocalReportPage";
import { COMMISSIONS_REPORT_QUERY } from "./gql";
import { CommissionRow, CommissionsReportResponse } from "./interface";
import {
  COMMISSIONS_FILTER_FIELDS,
  useCommissionsFilters,
} from "./useCommissionsFilters";
import {
  COMMISSIONS_SORT_COLUMNS,
  buildFactoryOption,
  buildSplitOption,
  byFactory,
  filterByPeriod,
  sortForReport,
  splitTotals,
  summarize,
} from "./utils";

export const COMMISSIONS_PER_PAGE = 20;

/**
 * Os dados do relatório de comissões.
 *
 * Ao contrário das outras abas, a query não pagina nem recebe período: a
 * `commissions` devolve todas as parcelas do vendedor/empresa de uma vez (é assim
 * que a tela de Comissões trabalha), e o recorte é feito aqui, pela data em que a
 * comissão CAI. Como o conjunto já está inteiro em memória, a paginação da tabela
 * também é local — e por isso o "Exportar" não precisa de uma segunda ida à rede.
 * Filtro e ordenação seguem o mesmo caminho, e é a lista JÁ filtrada e ordenada
 * que vai para o XLSX/PDF.
 */
export const useCommissionsReport = (
  filters: ReportFilters,
  /**
   * Quem gerencia vê a comissão repartida (empresa × vendedor). O vendedor não:
   * para ele `amount` JÁ é a comissão dele, e a diferença daria zero.
   */
  withOffice: boolean
) => {
  const { data, loading, error, refetch } = useQuery<CommissionsReportResponse>(
    COMMISSIONS_REPORT_QUERY,
    { variables: { sellerId: filters.sellerId } }
  );
  useQueryErrorToast(error, "Não foi possível carregar as comissões.");

  const allRows = useMemo(() => data?.commissions_report.rows ?? [], [data]);

  // As parcelas do período, na ordem da conferência — antes de qualquer filtro
  // ou ordenação da tela.
  const periodRows = useMemo(
    () => sortForReport(filterByPeriod(allRows, filters.from, filters.to)),
    [allRows, filters.from, filters.to]
  );

  const table = useLocalTable<CommissionRow>({
    items: periodRows,
    columns: COMMISSIONS_SORT_COLUMNS,
    fields: COMMISSIONS_FILTER_FIELDS,
  });

  const filterFields = useCommissionsFilters(periodRows);
  const rows = table.displayedData;

  // Cartões e gráfico falam do PERÍODO INTEIRO: filtrar por uma fábrica muda a
  // tabela, e o topo tem de continuar dizendo quanto o mês vale.
  const totals = useMemo(() => summarize(periodRows), [periodRows]);
  const groups = useMemo(() => byFactory(periodRows), [periodRows]);
  const split = useMemo(() => splitTotals(periodRows), [periodRows]);

  const kpis: ReportKpi[] = useMemo(
    () => [
      {
        label: "A receber no período",
        value: formatMoney(totals.receivable),
        hint: `${totals.countReceivable} parcela(s) liberada(s)`,
        status: totals.receivable > 0 ? "atencao" : "neutral",
      },
      {
        label: "Já recebido",
        value: formatMoney(totals.received),
        hint: "baixado no período",
        status: "ok",
      },
      {
        // Previsto ainda depende da fábrica faturar (ou do cliente pagar).
        label: "Previsto",
        value: formatMoney(totals.pending),
        hint: "depende do faturamento",
        status: "neutral",
      },
      {
        // Para quem gerencia, este total é a comissão da EMPRESA — os dois
        // cartões seguintes o repartem.
        label: withOffice ? "Comissão da empresa" : "Total do período",
        value: formatMoney(
          totals.receivable + totals.received + totals.pending
        ),
        hint: `${totals.count} parcela(s)`,
        status: "neutral",
      },
      ...(withOffice
        ? [
            {
              label: "Repasse aos vendedores",
              value: formatMoney(split.seller),
              hint: "sai do escritório",
              status: "atencao" as const,
            },
            {
              label: "Fica no escritório",
              value: formatMoney(split.office),
              hint: `${Math.round(split.margin * 100)}% do que veio das fábricas`,
              status: "ok" as const,
            },
          ]
        : []),
    ],
    [totals, split, withOffice]
  );

  const { currentPage, setCurrentPage, totalPages, pageRows } =
    useLocalReportPage(rows, COMMISSIONS_PER_PAGE);

  // O conjunto já está completo em memória: exportar é devolvê-lo, sem varrer
  // páginas como nas abas que paginam no servidor.
  const fetchAllRows = useCallback(
    async (): Promise<CommissionRow[]> => rows,
    [rows]
  );

  return {
    kpis,
    kpisLoading: loading && allRows.length === 0,
    chart: {
      option: buildFactoryOption(groups),
      hasData: groups.length > 0,
      loading,
      error,
      refetch: () => void refetch(),
    },
    splitChart: {
      option: buildSplitOption(groups),
      // Sem repasse configurado a barra seria uma cor só, repetindo o gráfico
      // de cima: o cartão só aparece quando há repartição para mostrar.
      hasData: groups.length > 0 && split.seller !== 0,
      loading,
      error,
      refetch: () => void refetch(),
    },
    split,
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
    totals,
    fetchAllRows,
    hasRows: rows.length > 0,
  };
};
