"use client";

import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { useTableData } from "@/hooks/useTableData";
import { formatMoney } from "@/utils/format/masks";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { useCallback, useMemo } from "react";

import { fetchAllPages } from "../fetchAllPages";
import { ReportFilters, ReportKpi } from "../interface";
import {
  PLACED_BY_FACTORY_QUERY,
  SENT_ORDERS_QUERY,
  SENT_ORDERS_STATS_QUERY,
} from "./gql";
import {
  PlacedByFactoryResponse,
  SentOrder,
  SentOrdersResponse,
  SentOrdersStatsResponse,
} from "./interface";
import { buildPlacedByFactoryOption, buildSentOrdersFilters } from "./utils";

export const SENT_ORDERS_PER_PAGE = 20;

/**
 * Os dados do relatório de pedidos enviados: quanto foi colocado na fábrica no
 * período e quanto disso ela já faturou.
 *
 * O gráfico usa `placedOrdersByFactory`, que aplica o MESMO recorte de situação
 * da tabela — as agregações genéricas do dashboard contam orçamento e cancelado,
 * e o gráfico acabaria maior que o total do topo.
 */
export const useSentOrdersReport = (filters: ReportFilters) => {
  const apollo = useApolloClient();
  const queryFilters = useMemo(
    () => buildSentOrdersFilters(filters),
    [filters]
  );

  const tableData = useTableData<SentOrdersResponse, SentOrder>({
    query: SENT_ORDERS_QUERY,
    fields: {},
    getConnection: (data) => data.sent_orders_report,
    itemsPerPage: SENT_ORDERS_PER_PAGE,
    baseFilters: queryFilters,
  });

  const statsQuery = useQuery<SentOrdersStatsResponse>(
    SENT_ORDERS_STATS_QUERY,
    {
      variables: {
        input: { first: SENT_ORDERS_PER_PAGE, filters: queryFilters },
      },
    }
  );
  useQueryErrorToast(
    statsQuery.error,
    "Não foi possível carregar os totais do relatório."
  );

  const chartQuery = useQuery<PlacedByFactoryResponse>(
    PLACED_BY_FACTORY_QUERY,
    {
      variables: {
        from: filters.from,
        to: filters.to,
        sellerId: filters.sellerId,
        limit: 8,
      },
    }
  );
  const points = useMemo(
    () => chartQuery.data?.placedOrdersByFactory ?? [],
    [chartQuery.data]
  );

  const stats = statsQuery.data?.sent_orders_report_stats;
  const pendingOrders =
    (stats?.totalOrders ?? 0) - (stats?.invoicedOrders ?? 0);
  const pendingAmount =
    Number(stats?.totalAmount ?? 0) - Number(stats?.invoicedAmount ?? 0);

  const kpis: ReportKpi[] = useMemo(
    () => [
      {
        label: "Pedidos enviados",
        value: String(stats?.totalOrders ?? 0),
        hint: "colocados na fábrica no período",
        status: "neutral",
      },
      {
        label: "Valor colocado",
        value: formatMoney(stats?.totalAmount ?? 0),
        hint: "soma dos pedidos enviados",
        status: "ok",
      },
      {
        label: "Já faturados",
        value: String(stats?.invoicedOrders ?? 0),
        hint: formatMoney(stats?.invoicedAmount ?? 0),
        status: "ok",
      },
      {
        // O número que faz o papel existir: o que ainda está parado na fábrica.
        label: "Aguardando faturamento",
        value: String(pendingOrders),
        hint: formatMoney(pendingAmount),
        status: pendingOrders > 0 ? "atencao" : "ok",
      },
    ],
    [stats, pendingOrders, pendingAmount]
  );

  const fetchAllRows = useCallback(
    () =>
      fetchAllPages<SentOrdersResponse, SentOrder>(
        apollo,
        SENT_ORDERS_QUERY,
        queryFilters,
        (data) => data.sent_orders_report
      ),
    [apollo, queryFilters]
  );

  return {
    kpis,
    kpisLoading: statsQuery.loading && !stats,
    chart: {
      option: buildPlacedByFactoryOption(points),
      hasData: points.length > 0,
      loading: chartQuery.loading,
      error: chartQuery.error,
      refetch: () => void chartQuery.refetch(),
    },
    tableData,
    fetchAllRows,
    hasRows: tableData.totalItems > 0,
  };
};
