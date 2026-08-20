"use client";

import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

import { DASHBOARD_SELLERS_QUERY } from "../gql";
import { DashboardSellersResponse } from "../interface";
import { formatDateRangeLabel } from "../utils";
import { ReportFilters } from "./interface";

/**
 * O recorte do relatório escrito por extenso, para o cabeçalho do documento.
 *
 * Um relatório de um vendedor impresso sem dizer isso passa por "a empresa
 * toda" — e é assim que uma reunião discute o número errado. Por isso o NOME do
 * vendedor, não o id: no papel, um UUID não informa ninguém.
 *
 * A query dos vendedores é a mesma da barra de filtros e sai do cache do Apollo;
 * não custa uma segunda ida à rede.
 */
export const useReportContext = (filters: ReportFilters) => {
  const { data } = useQuery<DashboardSellersResponse>(DASHBOARD_SELLERS_QUERY, {
    variables: { input: { first: 200 } },
    skip: !filters.sellerId,
    fetchPolicy: "cache-and-network",
  });

  const sellerName = useMemo(() => {
    if (!filters.sellerId) return null;
    const sellers =
      data?.dashboard_sellers?.edges.map((edge) => edge.node) ?? [];
    return (
      sellers.find((seller) => seller.id === filters.sellerId)?.name ?? null
    );
  }, [data, filters.sellerId]);

  const context = useMemo(
    () =>
      [
        `Período: ${formatDateRangeLabel(filters.from, filters.to)}`,
        // Sem vendedor escolhido o documento cobre a empresa toda, e é isso que
        // o papel precisa afirmar — a ausência da linha seria lida como omissão.
        `Vendedor: ${sellerName ?? "todos"}`,
      ].filter(Boolean),
    [filters.from, filters.to, sellerName]
  );

  return { context, sellerName };
};
