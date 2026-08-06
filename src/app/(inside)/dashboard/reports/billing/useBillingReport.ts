"use client";

import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { formatMoney } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { formatPercent } from "../../utils";
import { ReportFilters, ReportKpi } from "../interface";
import { useLocalReportPage } from "../useLocalReportPage";
import { BILLING_REPORT_QUERY } from "./gql";
import { BillingReportResponse, BillingRow, BillingScope } from "./interface";
import { buildFactoryOption, filterByScope } from "./utils";

export const BILLING_PER_PAGE = 25;

const EMPTY_REPORT = {
  rows: [] as BillingRow[],
  installmentCount: 0,
  orderCount: 0,
  totalAmount: "0",
  paidAmount: "0",
  dueAmount: "0",
  overdueAmount: "0",
  overdueCount: 0,
  commissionAmount: "0",
};

/**
 * Os dados da agenda de cobrança: as duplicatas que vencem no período.
 *
 * O relatório chega inteiro do backend, então o recorte por situação e a
 * paginação são locais — e os dois moram na URL, para o link levar ao mesmo
 * papel (ver `useLocalReportPage`).
 *
 * Os KPIs vêm do fechamento do SERVIDOR, não da soma das linhas à vista: o
 * recorte "só as vencidas" muda a tabela, e o topo tem de continuar dizendo
 * quanto o período inteiro vale — senão trocar de visão parece mudar o mês.
 */
export const useBillingReport = (filters: ReportFilters) => {
  const searchParams = useSearchParams();
  const scope = (searchParams.get("scope") ?? "all") as BillingScope;

  const { data, loading, error, refetch } = useQuery<BillingReportResponse>(
    BILLING_REPORT_QUERY,
    {
      variables: {
        from: filters.from,
        to: filters.to,
        sellerId: filters.sellerId,
      },
    }
  );
  useQueryErrorToast(error, "Não foi possível carregar o faturamento.");

  const report = data?.billingReport ?? EMPTY_REPORT;

  const rows = useMemo(
    () => filterByScope(report.rows, scope),
    [report.rows, scope]
  );

  const { currentPage, setCurrentPage, totalPages, pageRows, push } =
    useLocalReportPage(rows, BILLING_PER_PAGE);

  const setScope = useCallback(
    (next: BillingScope) =>
      // Trocar de visão zera a página: a lista de vencidas é bem menor que a
      // do mês inteiro, e a página 4 dela costuma não existir.
      push({ scope: next === "all" ? null : next, page: null }),
    [push]
  );

  const kpis: ReportKpi[] = useMemo(() => {
    const total = Number(report.totalAmount || 0);
    const overdue = Number(report.overdueAmount || 0);
    return [
      {
        label: "Vence no período",
        value: formatMoney(report.totalAmount),
        hint: `${report.installmentCount} parcela(s) de ${report.orderCount} pedido(s)`,
        status: "neutral",
      },
      {
        label: "Vencido",
        value: formatMoney(report.overdueAmount),
        hint:
          total > 0
            ? `${report.overdueCount} parcela(s) · ${formatPercent(overdue / total)} do período`
            : "nada vencido",
        status: overdue > 0 ? "urgente" : "ok",
      },
      {
        label: "A vencer",
        value: formatMoney(report.dueAmount),
        hint: "ainda dentro do prazo",
        status: "atencao",
      },
      {
        label: "Pago",
        value: formatMoney(report.paidAmount),
        hint: `comissão do período: ${formatMoney(report.commissionAmount)}`,
        status: "ok",
      },
    ];
  }, [report]);

  /** O que vai para a planilha e o PDF: o recorte à vista, inteiro. */
  const fetchAllRows = useCallback(
    async (): Promise<BillingRow[]> => rows,
    [rows]
  );

  return {
    report,
    kpis,
    kpisLoading: loading && report.rows.length === 0,
    chart: {
      option: buildFactoryOption(rows),
      hasData: rows.length > 0,
      loading,
      error,
      refetch: () => void refetch(),
    },
    rows,
    pageRows,
    scope,
    setScope,
    currentPage,
    setCurrentPage,
    totalPages,
    loading,
    fetchAllRows,
    hasRows: rows.length > 0,
  };
};
