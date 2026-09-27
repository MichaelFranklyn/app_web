"use client";

import { buildQueryFilters } from "@/hooks/useTableData";
import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

import { ORDER_TAB_COUNTS_QUERY } from "./gql";
import { PENDING_ORDER_TABLE_FIELDS } from "./utils";

interface TabCounts {
  pending: { totalOrders: number } | null;
  delivery: { totalOrders: number } | null;
}

const scoped = (field: string, filters: object[]) => ({
  filters: [{ field, value: "true", operator: "eq" }, ...filters],
});

/**
 * Quantos pedidos esperam em cada fila, com os mesmos filtros da tela (menos a
 * situação, que nas duas abas é o próprio recorte): o número da aba bate com a
 * lista que ela abre. "Todos os pedidos" fica sem número de propósito — a
 * lista mostra orçamento e cancelado, e o `orderStats` conta só pedido feito.
 */
export function useOrderTabCounts(inputValues: Record<string, string>) {
  const filters = useMemo(
    () => buildQueryFilters(PENDING_ORDER_TABLE_FIELDS, inputValues),
    [inputValues]
  );
  const { data, refetch } = useQuery<TabCounts>(ORDER_TAB_COUNTS_QUERY, {
    variables: {
      pending: scoped("pending_invoice", filters),
      delivery: scoped("awaiting_delivery", filters),
    },
  });

  return {
    pending: data?.pending?.totalOrders,
    delivery: data?.delivery?.totalOrders,
    refetch,
  };
}

/** "Esperando entrega (59)"; sem o número enquanto ele não chega. */
export const withCount = (label: string, count: number | undefined) =>
  count === undefined ? label : `${label} (${count})`;
