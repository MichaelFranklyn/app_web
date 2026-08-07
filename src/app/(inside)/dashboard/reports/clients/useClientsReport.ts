"use client";

import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { buildQueryFilters, useTableData } from "@/hooks/useTableData";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { useCallback, useMemo } from "react";

import { fetchAllPages } from "../fetchAllPages";
import { ReportFilters, ReportKpi } from "../interface";
import {
  CLIENTS_AT_RISK_QUERY,
  CLIENTS_REPORT_QUERY,
  CLIENTS_REPORT_STATS_QUERY,
} from "./gql";
import {
  ClientReportRow,
  ClientsAtRiskResponse,
  ClientsReportResponse,
  ClientsReportStatsResponse,
} from "./interface";
import { useClientsReportFilters } from "./useClientsReportFilters";
import {
  CLIENTS_REPORT_SORTABLE_FIELDS,
  CLIENTS_REPORT_TABLE_FIELDS,
  buildAtRiskOption,
  buildClientsFilters,
} from "./utils";

export const CLIENTS_PER_PAGE = 20;

/**
 * Os dados do relatório de clientes.
 *
 * Este relatório é um RETRATO da carteira, não um recorte de período: os cartões e
 * a tabela respondem "como está a carteira hoje". O período do filtro governa o
 * gráfico de atraso, que é o único número aqui que depende de um intervalo (o
 * ritmo de compra de cada cliente sai dos pedidos do período).
 */
export const useClientsReport = (filters: ReportFilters) => {
  const apollo = useApolloClient();
  const queryFilters = useMemo(
    () => buildClientsFilters(filters.sellerId),
    [filters.sellerId]
  );

  const tableData = useTableData<ClientsReportResponse, ClientReportRow>({
    query: CLIENTS_REPORT_QUERY,
    fields: CLIENTS_REPORT_TABLE_FIELDS,
    getConnection: (data) => data.clients_report,
    itemsPerPage: CLIENTS_PER_PAGE,
    sortableFields: CLIENTS_REPORT_SORTABLE_FIELDS,
    baseFilters: queryFilters,
  });

  const filterFields = useClientsReportFilters();

  // O recorte COMPLETO da tabela: o do relatório (vendedor) mais o que o painel
  // pediu. É o que a exportação repete.
  const exportFilters = useMemo(
    () => [
      ...queryFilters,
      ...buildQueryFilters(CLIENTS_REPORT_TABLE_FIELDS, tableData.inputValues),
    ],
    [queryFilters, tableData.inputValues]
  );

  const statsQuery = useQuery<ClientsReportStatsResponse>(
    CLIENTS_REPORT_STATS_QUERY,
    { variables: { sellerId: filters.sellerId } }
  );
  useQueryErrorToast(
    statsQuery.error,
    "Não foi possível carregar os totais da carteira."
  );

  const riskQuery = useQuery<ClientsAtRiskResponse>(CLIENTS_AT_RISK_QUERY, {
    variables: {
      from: filters.from,
      to: filters.to,
      sellerId: filters.sellerId,
      limit: 10,
    },
  });
  const riskPoints = useMemo(
    () => riskQuery.data?.clientsAtRisk ?? [],
    [riskQuery.data]
  );

  const stats = statsQuery.data?.clients_report_stats;
  const kpis: ReportKpi[] = useMemo(
    () => [
      {
        label: "Clientes na carteira",
        value: String(stats?.totalClients ?? 0),
        hint: "vinculados hoje",
        status: "neutral",
      },
      {
        label: "Ativos",
        value: String(stats?.activeClients ?? 0),
        hint: "com compra recente",
        status: "ok",
      },
      {
        label: "Atrasados para voltar",
        value: String(stats?.atRiskClients ?? 0),
        hint: "passaram do próprio ritmo",
        status: (stats?.atRiskClients ?? 0) > 0 ? "atencao" : "ok",
      },
      {
        label: "Sem visita há 30 dias",
        value: String(stats?.noVisit30d ?? 0),
        hint: "nenhuma visita registrada",
        status: (stats?.noVisit30d ?? 0) > 0 ? "urgente" : "ok",
      },
    ],
    [stats]
  );

  const fetchAllRows = useCallback(
    () =>
      fetchAllPages<ClientsReportResponse, ClientReportRow>(
        apollo,
        CLIENTS_REPORT_QUERY,
        exportFilters,
        (data) => data.clients_report,
        tableData.order
      ),
    [apollo, exportFilters, tableData.order]
  );

  return {
    filterFields,
    kpis,
    kpisLoading: statsQuery.loading && !stats,
    chart: {
      option: buildAtRiskOption(riskPoints),
      hasData: riskPoints.length > 0,
      loading: riskQuery.loading,
      error: riskQuery.error,
      refetch: () => void riskQuery.refetch(),
    },
    tableData,
    fetchAllRows,
    hasRows: tableData.totalItems > 0,
  };
};
