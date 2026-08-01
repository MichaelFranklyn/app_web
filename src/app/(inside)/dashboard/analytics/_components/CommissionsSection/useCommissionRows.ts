"use client";

import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { useMemo } from "react";

import { ChartFilters } from "../../interface";
import { COMMISSION_ROWS_QUERY } from "./gql";
import { CommissionRowsResponse, ScopedCommissionRow } from "./interface";
import { scopeCommissionRows } from "./utils";

export interface UseCommissionRowsReturn {
  rows: ScopedCommissionRow[];
  loading: boolean;
  error?: Error;
  refetch: () => void;
}

/**
 * Fonte de dados de todos os gráficos da seção: busca as linhas de comissão uma
 * vez (o cache do Apollo serve os outros cards) e devolve já recortadas pelo
 * período e pelo vendedor escolhidos no topo da página.
 *
 * Fica no pai do grupo porque é código compartilhado entre os gráficos-irmãos —
 * nenhum deles importa do outro.
 */
export const useCommissionRows = (
  filters: ChartFilters
): UseCommissionRowsReturn => {
  const { data, loading, error, refetch } =
    useAsyncQuery<CommissionRowsResponse>(COMMISSION_ROWS_QUERY, {
      skip: false,
    });

  const rows = useMemo(
    () => scopeCommissionRows(data?.commissions.rows ?? [], filters),
    [data, filters]
  );

  return { rows, loading, error, refetch: () => void refetch() };
};
