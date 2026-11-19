"use client";

import { useHeldResult } from "@/hooks/useHeldResult";
import { useSeedQuery } from "@/hooks/useSeedQuery";
import { useTableFilters } from "@/hooks/useTableFilters";
import { useQuery } from "@apollo/client/react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { MY_PENDING_ITEMS_QUERY } from "./gql";
import {
  MyPendingItemsResponse,
  PendingContentProps,
  PendingType,
  PendingWhen,
} from "./interface";
import {
  openTypeOf,
  PENDING_FILTER_FIELDS,
  pendingSummaryVariables,
  visibleTypeCounts,
} from "./utils";

/**
 * O estado da central: filtros, assunto aberto e página na URL; cartões e
 * contadores do backend.
 *
 * Na URL, e não em `useState`, porque esta é a tela de TRABALHO: a pessoa
 * abre um pedido, resolve, e volta — e tem de cair no mesmo assunto, no mesmo
 * filtro e na mesma página, agora com uma linha a menos.
 */
export function usePendingSummary({
  canSelectSeller,
  seed,
}: PendingContentProps) {
  const filters = useTableFilters(PENDING_FILTER_FIELDS);
  const searchParams = useSearchParams();
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

  useSeedQuery([
    {
      query: MY_PENDING_ITEMS_QUERY,
      variables: pendingSummaryVariables({}, canSelectSeller),
      data: seed,
    },
  ]);

  const variables = useMemo(
    () => pendingSummaryVariables(filters.queryValues, canSelectSeller),
    [filters.queryValues, canSelectSeller]
  );

  const query = useQuery<MyPendingItemsResponse>(MY_PENDING_ITEMS_QUERY, {
    variables,
    // A leitura é do momento: quem resolveu uma pendência e voltou tem de ver
    // o número menor, não a foto de quando abriu a tela.
    fetchPolicy: "cache-and-network",
  });

  // Enquanto o filtro novo carrega, os cartões anteriores continuam na tela —
  // trocar tudo por esqueleto a cada clique faz a tela piscar.
  // Num filtro novo que falhou, a tela mostra o erro, não os cartões velhos.
  const { loading, refetch } = query;
  const held = useHeldResult(query, variables);
  const summary = held.shown?.myPendingItems?.data ?? null;

  const openType = openTypeOf(filters.inputValues);
  /**
   * Abre a lista de um assunto; clicar no aberto de novo fecha. `section` sai
   * junto: é só a porta de entrada do link antigo, e deixá-la na URL reabriria
   * os boletos depois de a pessoa fechar o cartão.
   */
  const toggleType = (type: PendingType) =>
    filters.setFilters({
      type: openType === type ? undefined : type,
      section: undefined,
    });

  const activeWhen = (filters.inputValues.when || null) as PendingWhen | null;
  /** O contador clicado vira filtro; clicar no ativo de novo desfaz. */
  const toggleWhen = (when: PendingWhen) =>
    filters.setFilters({ when: activeWhen === when ? undefined : when });

  const cards = useMemo(
    () => visibleTypeCounts(summary?.counts ?? [], openType),
    [summary, openType]
  );

  return {
    summary,
    cards,
    whenCounts: summary?.whenCounts ?? [],
    openType,
    toggleType,
    activeWhen,
    toggleWhen,
    loading,
    /** Erro sem nada para mostrar — com dado em tela, a falha não o apaga. */
    failed: held.failed,
    showSkeleton: loading && !summary,
    refetch,
    filterValues: filters.inputValues,
    queryValues: filters.queryValues,
    setFilters: filters.setFilters,
    currentPage,
    setCurrentPage: filters.setPage,
  };
}
