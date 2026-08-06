"use client";

import { useLocalTable } from "@/hooks/useLocalTable";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { formatMoney } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";
import { useCallback, useMemo } from "react";

import { ReportFilters, ReportKpi } from "../interface";
import { useLocalReportPage } from "../useLocalReportPage";
import { CLIENT_FACTORY_PURCHASES_QUERY } from "./gql";
import { PurchaseRow, PurchasesReportResponse } from "./interface";
import {
  PURCHASE_FILTER_FIELDS,
  usePurchaseFilters,
} from "./usePurchaseFilters";
import {
  buildFactorySituationOption,
  factoryOptions,
  PURCHASE_SORT_COLUMNS,
} from "./utils";

export const PURCHASES_PER_PAGE = 25;

const EMPTY_REPORT = {
  rows: [] as PurchaseRow[],
  totalRows: 0,
  clientCount: 0,
  factoryCount: 0,
  neverBoughtRows: 0,
  atRiskRows: 0,
  inactiveRows: 0,
  periodOrderCount: 0,
  periodAmount: "0",
};

/**
 * As últimas compras de cada cliente em cada fábrica.
 *
 * A pergunta que esta aba responde não é "quando o cliente comprou" (isso é a
 * situação da carteira), e sim "quando ele comprou DESTA fábrica" — um cliente em
 * dia com uma fábrica pode estar parado há meses em outra, e é essa segunda
 * conversa que a reunião com a fábrica cobra.
 *
 * A situação e o ritmo são de HOJE e da história inteira do par; o período do
 * filtro governa só as colunas "no período". Os KPIs saem do fechamento do
 * servidor (todos os pares), não do recorte à vista: escolher "só os parados"
 * muda a tabela, e o topo tem de continuar dizendo o tamanho do todo.
 *
 * O relatório vem inteiro do backend, então filtro, ordenação e paginação são
 * locais — e é a lista JÁ filtrada e ordenada que vai para o XLSX/PDF.
 */
export const usePurchasesReport = (filters: ReportFilters) => {
  const { data, loading, error, refetch } = useQuery<PurchasesReportResponse>(
    CLIENT_FACTORY_PURCHASES_QUERY,
    {
      variables: {
        from: filters.from,
        to: filters.to,
        sellerId: filters.sellerId,
      },
    }
  );
  useQueryErrorToast(error, "Não foi possível carregar as últimas compras.");

  const report = data?.clientFactoryPurchasesReport ?? EMPTY_REPORT;

  const table = useLocalTable<PurchaseRow>({
    items: report.rows,
    columns: PURCHASE_SORT_COLUMNS,
    fields: PURCHASE_FILTER_FIELDS,
  });

  const factories = useMemo(() => factoryOptions(report.rows), [report.rows]);
  const filterFields = usePurchaseFilters(factories);

  const rows = table.displayedData;

  const { currentPage, setCurrentPage, totalPages, pageRows } =
    useLocalReportPage(rows, PURCHASES_PER_PAGE);

  const kpis: ReportKpi[] = useMemo(() => {
    const needAttention = report.atRiskRows + report.inactiveRows;
    return [
      {
        label: "Cliente × fábrica",
        value: String(report.totalRows),
        hint: `${report.clientCount} cliente(s) em ${report.factoryCount} fábrica(s)`,
        status: "neutral",
      },
      {
        // Atrasado e parado juntos: é a fila de trabalho, e separá-la em dois
        // cartões esconderia o tamanho do problema.
        label: "Atrasados na fábrica",
        value: String(needAttention),
        hint: `${report.atRiskRows} atrasado(s) · ${report.inactiveRows} parado(s)`,
        status: needAttention > 0 ? "urgente" : "ok",
      },
      {
        label: "Nunca compraram",
        value: String(report.neverBoughtRows),
        hint: "vinculados à fábrica sem nenhum pedido nela",
        status: report.neverBoughtRows > 0 ? "atencao" : "ok",
      },
      {
        label: "Comprado no período",
        value: formatMoney(report.periodAmount),
        hint: `${report.periodOrderCount} compra(s), pela data do pedido`,
        status: "atencao",
      },
    ];
  }, [report]);

  const fetchAllRows = useCallback(
    async (): Promise<PurchaseRow[]> => rows,
    [rows]
  );

  return {
    report,
    kpis,
    kpisLoading: loading && report.rows.length === 0,
    chart: {
      option: buildFactorySituationOption(report.rows),
      hasData: report.totalRows > 0,
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
