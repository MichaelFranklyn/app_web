"use client";

import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { formatMoney } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { ReportFilters, ReportKpi } from "../interface";
import { COMMISSIONS_REPORT_QUERY } from "./gql";
import { CommissionRow, CommissionsReportResponse } from "./interface";
import {
  buildFactoryOption,
  byFactory,
  filterByPeriod,
  sortForReport,
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
 */
export const useCommissionsReport = (filters: ReportFilters) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

  // A página vive na URL, como nas abas que paginam no servidor: voltar no
  // navegador desfaz a virada de página em vez de sair da tela.
  const setCurrentPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) params.delete("page");
      else params.set("page", String(page));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const { data, loading, error, refetch } = useQuery<CommissionsReportResponse>(
    COMMISSIONS_REPORT_QUERY,
    { variables: { sellerId: filters.sellerId } }
  );
  useQueryErrorToast(error, "Não foi possível carregar as comissões.");

  const allRows = useMemo(() => data?.commissions_report.rows ?? [], [data]);

  const rows = useMemo(
    () => sortForReport(filterByPeriod(allRows, filters.from, filters.to)),
    [allRows, filters.from, filters.to]
  );

  const totals = useMemo(() => summarize(rows), [rows]);
  const groups = useMemo(() => byFactory(rows), [rows]);

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
        label: "Total do período",
        value: formatMoney(
          totals.receivable + totals.received + totals.pending
        ),
        hint: `${totals.count} parcela(s)`,
        status: "neutral",
      },
    ],
    [totals]
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / COMMISSIONS_PER_PAGE));
  const pageRows = useMemo(
    () =>
      rows.slice(
        (currentPage - 1) * COMMISSIONS_PER_PAGE,
        currentPage * COMMISSIONS_PER_PAGE
      ),
    [rows, currentPage]
  );

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
