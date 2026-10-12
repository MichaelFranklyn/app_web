"use client";

import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { useTableFilters } from "@/hooks/useTableFilters";
import { useUrlSort } from "@/hooks/useUrlSort";
import { formatMoney } from "@/utils/format/masks";
import { MAX_SCAN_PAGES } from "@/utils/pagination";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { ReportFilters, ReportKpi } from "../interface";
import {
  COMMISSIONS_REPORT_EXPORT_QUERY,
  COMMISSIONS_REPORT_QUERY,
} from "./gql";
import {
  CommissionRow,
  CommissionsReportExportResponse,
  CommissionsReportResponse,
} from "./interface";
import {
  COMMISSIONS_FILTER_CONFIG,
  useCommissionsFilters,
} from "./useCommissionsFilters";
import {
  buildFactoryOption,
  buildSplitOption,
  COMMISSIONS_SORT_KEYS,
  factoriesFromServer,
  totalsFromServer,
} from "./utils";

export const COMMISSIONS_PER_PAGE = 20;
/** Página da varredura da exportação (o servidor aceita até 500). */
export const COMMISSIONS_EXPORT_PAGE = 500;

/**
 * Os dados do relatório de comissões.
 *
 * Período, filtros do painel, ordenação e página vão ao SERVIDOR, que devolve
 * só a página aberta e as somas prontas. Antes a query trazia a carteira
 * inteira — todas as parcelas de todos os anos — e tudo era feito aqui; com o
 * histórico crescendo, abrir a aba custava segundos e dezenas de MB.
 *
 * Os números não mudaram de régua: cartões e gráficos somam o PERÍODO inteiro
 * (filtrar uma fábrica muda a tabela, e o topo tem de continuar dizendo quanto
 * o mês vale); o rodapé da tabela soma TODAS as linhas que os filtros deixaram
 * — antes falava só da página aberta.
 */
export const useCommissionsReport = (
  filters: ReportFilters,
  /**
   * Quem gerencia vê a comissão repartida (empresa × vendedor). O vendedor não:
   * para ele `amount` JÁ é a comissão dele, e a diferença daria zero.
   */
  withOffice: boolean
) => {
  const apollo = useApolloClient();
  const searchParams = useSearchParams();
  const table = useTableFilters(COMMISSIONS_FILTER_CONFIG);
  const sort = useUrlSort(COMMISSIONS_SORT_KEYS, table.setParams);
  const requestedPage = Math.max(1, Number(searchParams.get("page")) || 1);

  // O recorte inteiro, sem a página: é o mesmo para a tela e para o arquivo.
  const baseInput = useMemo(() => {
    const panel: Record<string, string> = {};
    for (const [key, value] of Object.entries(table.queryValues)) {
      const config = COMMISSIONS_FILTER_CONFIG[key];
      if (value && config) panel[config.queryField] = value;
    }
    return {
      from: filters.from,
      to: filters.to,
      sellerId: filters.sellerId,
      ...panel,
      ...(sort.key && { sortBy: sort.key, sortDir: sort.direction }),
    };
  }, [filters.from, filters.to, filters.sellerId, table.queryValues, sort]);

  const { data, previousData, loading, error, refetch } =
    useQuery<CommissionsReportResponse>(COMMISSIONS_REPORT_QUERY, {
      fetchPolicy: "cache-and-network",
      variables: {
        input: {
          ...baseInput,
          first: COMMISSIONS_PER_PAGE,
          offset: (requestedPage - 1) * COMMISSIONS_PER_PAGE,
        },
      },
    });
  useQueryErrorToast(error, "Não foi possível carregar as comissões.");

  // Trocar de página ou de filtro mantém a resposta anterior na tela até a
  // nova chegar — sem piscar o esqueleto a cada clique.
  const report = (data ?? previousData)?.commissions_report;
  const rows = useMemo(() => report?.rows ?? [], [report]);
  const totalCount = report?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / COMMISSIONS_PER_PAGE));

  const filterFields = useCommissionsFilters({
    factories: report?.factoryOptions ?? [],
    sellers: report?.sellerOptions ?? [],
    statuses: report?.statusOptions ?? [],
  });

  const { totals, split } = useMemo(
    () => totalsFromServer(report?.periodTotals),
    [report]
  );
  const filtered = useMemo(
    () => totalsFromServer(report?.filteredTotals).totals,
    [report]
  );
  const groups = useMemo(
    () => factoriesFromServer(report?.byFactory),
    [report]
  );

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

  /**
   * Todas as linhas do recorte, para o arquivo — página a página, no servidor,
   * com o mesmo período, filtros e ordem da tela. Não depende da página aberta.
   * `network-only`: o arquivo não pode sair de um cache antigo.
   */
  const fetchAllRows = useCallback(async (): Promise<CommissionRow[]> => {
    const all: CommissionRow[] = [];
    for (let page = 0; page < MAX_SCAN_PAGES; page += 1) {
      const result = await apollo.query<CommissionsReportExportResponse>({
        query: COMMISSIONS_REPORT_EXPORT_QUERY,
        variables: {
          input: {
            ...baseInput,
            first: COMMISSIONS_EXPORT_PAGE,
            offset: page * COMMISSIONS_EXPORT_PAGE,
          },
        },
        fetchPolicy: "network-only",
      });
      const chunk = result.data?.commissions_report_export;
      if (!chunk) break;
      all.push(...chunk.rows);
      if (
        chunk.rows.length < COMMISSIONS_EXPORT_PAGE ||
        all.length >= chunk.totalCount
      ) {
        break;
      }
    }
    return all;
  }, [apollo, baseInput]);

  return {
    kpis,
    kpisLoading: loading && !report,
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
    sort,
    pageRows: rows,
    currentPage: Math.min(requestedPage, totalPages),
    setCurrentPage: table.setPage,
    totalPages,
    totalItems: totalCount,
    /** Somas de TODAS as linhas filtradas (rodapé), não só da página. */
    filteredTotals: filtered,
    loading,
    totals,
    fetchAllRows,
    hasRows: totalCount > 0,
  };
};
