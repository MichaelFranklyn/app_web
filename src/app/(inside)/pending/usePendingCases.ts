"use client";

import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

import { MY_PENDING_CASES_QUERY } from "./gql";
import { PendingCasesResponse, PendingType } from "./interface";
import { ITEMS_PER_PAGE, pendingCasesVariables } from "./utils";

interface Params {
  type: PendingType;
  /** Os filtros da URL — o mesmo recorte dos cartões. */
  filterValues: Record<string, string>;
  page: number;
  canSelectSeller: boolean;
  /** O total do cartão: é o que vale enquanto a primeira página não volta. */
  fallbackTotal: number;
}

/** A lista de um assunto, uma página por vez. */
export function usePendingCases({
  type,
  filterValues,
  page,
  canSelectSeller,
  fallbackTotal,
}: Params) {
  const variables = useMemo(
    () => pendingCasesVariables(filterValues, type, page, canSelectSeller),
    [filterValues, type, page, canSelectSeller]
  );

  const { data, previousData, loading, error, refetch } =
    useQuery<PendingCasesResponse>(MY_PENDING_CASES_QUERY, {
      variables,
      fetchPolicy: "cache-and-network",
    });

  // Trocar de página mantém a anterior na tela até a nova chegar.
  const result = (data ?? previousData)?.myPendingItems?.data ?? null;
  const total = result?.totalCount ?? fallbackTotal;

  return {
    items: result?.items ?? [],
    total,
    totalPages: Math.max(1, Math.ceil(total / ITEMS_PER_PAGE)),
    loading,
    failed: !!error && !result,
    showSpinner: loading && !result,
    refetch,
  };
}
