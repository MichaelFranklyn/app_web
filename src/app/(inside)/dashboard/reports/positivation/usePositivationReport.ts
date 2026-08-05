"use client";

import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { formatMoney } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { formatPercent } from "../../utils";
import { ReportFilters, ReportKpi } from "../interface";
import { POSITIVATION_REPORT_QUERY } from "./gql";
import {
  PositivationReportResponse,
  PositivationRow,
  PositivationScope,
} from "./interface";
import { buildFactoryRateOption, filterByScope, summarizeRows } from "./utils";

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
 * quem não comprou, que é o assunto), então o escopo e a paginação são locais. O
 * escopo mora na URL junto do período, para o link levar ao mesmo recorte.
 */
export const usePositivationReport = (filters: ReportFilters) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const scope = (searchParams.get("scope") ?? "all") as PositivationScope;
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

  const push = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === null) params.delete(key);
        else params.set(key, value);
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const setScope = useCallback(
    (next: PositivationScope) =>
      // Trocar de escopo volta para a página 1: a lista de zerados é bem menor
      // que a carteira, e a página 4 dela costuma não existir.
      push({ scope: next === "all" ? null : next, page: null }),
    [push]
  );

  const setCurrentPage = useCallback(
    (page: number) => push({ page: page <= 1 ? null : String(page) }),
    [push]
  );

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

  const rows = useMemo(
    () => filterByScope(report.rows, scope),
    [report.rows, scope]
  );

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

  const totalPages = Math.max(
    1,
    Math.ceil(rows.length / POSITIVATION_PER_PAGE)
  );
  const pageRows = useMemo(
    () =>
      rows.slice(
        (currentPage - 1) * POSITIVATION_PER_PAGE,
        currentPage * POSITIVATION_PER_PAGE
      ),
    [rows, currentPage]
  );

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
    rows,
    pageRows,
    totals: summarizeRows(rows),
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
