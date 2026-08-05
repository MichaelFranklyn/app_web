"use client";

import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { useTableData } from "@/hooks/useTableData";
import { formatMoney } from "@/utils/format/masks";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { useCallback, useMemo } from "react";

import { fetchAllPages } from "../fetchAllPages";
import { ReportFilters, ReportKpi } from "../interface";
import {
  INVOICED_BY_FACTORY_QUERY,
  INVOICED_BY_MONTH_QUERY,
  SALES_REPORT_ORDERS_QUERY,
  SALES_REPORT_STATS_QUERY,
} from "./gql";
import {
  InvoicedByFactoryResponse,
  InvoicedByMonthResponse,
  SalesReportOrder,
  SalesReportOrdersResponse,
  SalesReportStatsResponse,
} from "./interface";
import {
  buildFactoryOption,
  buildMonthOption,
  buildSalesFilters,
  monthsInRange,
} from "./utils";

/** Linhas por página da tabela do relatório. */
export const SALES_PER_PAGE = 20;

/**
 * Os dados do relatório de vendas: o fechamento, o gráfico e a página de linhas.
 *
 * Os três saem do MESMO recorte (período por data de faturamento + vendedor) —
 * é o que evita a tela mostrar dois números para a mesma pergunta.
 *
 * O gráfico troca de forma conforme o período: um mês só teria uma barra num
 * gráfico mensal, então aí a leitura útil é o ranking de fábricas; a partir de
 * dois meses, a evolução mês a mês passa a dizer mais.
 */
export const useSalesReport = (filters: ReportFilters) => {
  const apollo = useApolloClient();

  const queryFilters = useMemo(() => buildSalesFilters(filters), [filters]);
  const showMonthly = monthsInRange(filters.from, filters.to) > 1;

  const tableData = useTableData<SalesReportOrdersResponse, SalesReportOrder>({
    query: SALES_REPORT_ORDERS_QUERY,
    fields: {},
    getConnection: (data) => data.sales_report_orders,
    itemsPerPage: SALES_PER_PAGE,
    baseFilters: queryFilters,
  });

  const statsQuery = useQuery<SalesReportStatsResponse>(
    SALES_REPORT_STATS_QUERY,
    { variables: { input: { first: SALES_PER_PAGE, filters: queryFilters } } }
  );
  useQueryErrorToast(
    statsQuery.error,
    "Não foi possível carregar os totais do relatório."
  );

  const chartVariables = {
    from: filters.from,
    to: filters.to,
    sellerId: filters.sellerId,
  };

  const factoryQuery = useQuery<InvoicedByFactoryResponse>(
    INVOICED_BY_FACTORY_QUERY,
    { variables: { ...chartVariables, limit: 8 }, skip: showMonthly }
  );
  const monthQuery = useQuery<InvoicedByMonthResponse>(
    INVOICED_BY_MONTH_QUERY,
    {
      variables: chartVariables,
      skip: !showMonthly,
    }
  );

  const factoryPoints = useMemo(
    () => factoryQuery.data?.invoicedRevenueByFactory ?? [],
    [factoryQuery.data]
  );
  const monthPoints = useMemo(
    () => monthQuery.data?.invoicedRevenueByMonth ?? [],
    [monthQuery.data]
  );

  const chart = useMemo(() => {
    if (showMonthly) {
      return {
        title: "Faturamento mês a mês",
        description:
          "Pelo mês em que a fábrica faturou. A linha verde é a comissão, no eixo da direita.",
        option: buildMonthOption(monthPoints),
        hasData: monthPoints.length > 0,
        loading: monthQuery.loading,
        error: monthQuery.error,
        refetch: () => void monthQuery.refetch(),
      };
    }
    return {
      title: "Faturamento por fábrica",
      description: "De quem veio o faturamento do período, maiores primeiro.",
      option: buildFactoryOption(factoryPoints),
      hasData: factoryPoints.length > 0,
      loading: factoryQuery.loading,
      error: factoryQuery.error,
      refetch: () => void factoryQuery.refetch(),
    };
  }, [showMonthly, monthPoints, factoryPoints, monthQuery, factoryQuery]);

  const stats = statsQuery.data?.sales_report_stats;
  const kpis: ReportKpi[] = useMemo(
    () => [
      {
        label: "Pedidos faturados",
        value: String(stats?.totalOrders ?? 0),
        hint: "no período de faturamento",
        status: "neutral",
      },
      {
        label: "Faturamento",
        value: formatMoney(stats?.totalAmount ?? 0),
        hint: "soma dos pedidos faturados",
        status: "ok",
      },
      {
        label: "Ticket médio",
        value: formatMoney(stats?.avgTicket ?? 0),
        hint: "faturamento ÷ pedidos",
        status: "neutral",
      },
      {
        label: "Comissão gerada",
        value: formatMoney(stats?.commissionAmount ?? 0),
        hint: "o que o faturamento rendeu",
        status: "atencao",
      },
    ],
    [stats]
  );

  /** Todas as linhas do recorte, para a planilha e o PDF. */
  const fetchAllRows = useCallback(
    () =>
      fetchAllPages<SalesReportOrdersResponse, SalesReportOrder>(
        apollo,
        SALES_REPORT_ORDERS_QUERY,
        queryFilters,
        (data) => data.sales_report_orders
      ),
    [apollo, queryFilters]
  );

  return {
    kpis,
    kpisLoading: statsQuery.loading && !stats,
    chart,
    tableData,
    fetchAllRows,
    hasRows: tableData.totalItems > 0,
  };
};
