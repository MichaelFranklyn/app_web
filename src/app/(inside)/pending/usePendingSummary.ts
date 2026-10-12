"use client";

import { FilterField } from "@/components/Filters";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useSeedQuery } from "@/hooks/useSeedQuery";
import { useTableFilters } from "@/hooks/useTableFilters";
import { useQuery } from "@apollo/client/react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { MY_PENDING_ITEMS_QUERY, PENDING_SELLERS_QUERY } from "./gql";
import {
  MyPendingItemsResponse,
  PendingContentProps,
  PendingSellersResponse,
  PendingType,
  PendingWhen,
} from "./interface";
import {
  openTypeOf,
  PENDING_FILTER_FIELDS,
  pendingSummaryVariables,
  visibleTypeCounts,
} from "./utils";

const EMPTY_INPUT = {};
const getSellers = (d: PendingSellersResponse) => d.pending_sellers;

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

  const { data, previousData, loading, error, refetch } =
    useQuery<MyPendingItemsResponse>(MY_PENDING_ITEMS_QUERY, {
      variables,
      // A leitura é do momento: quem resolveu uma pendência e voltou tem de ver
      // o número menor, não a foto de quando abriu a tela.
      fetchPolicy: "cache-and-network",
    });

  // Enquanto o filtro novo carrega, os cartões anteriores continuam na tela —
  // trocar tudo por esqueleto a cada clique faz a tela piscar.
  const summary = (data ?? previousData)?.myPendingItems?.data ?? null;

  const sellersQuery = useCompleteList<PendingSellersResponse>(
    PENDING_SELLERS_QUERY,
    EMPTY_INPUT,
    getSellers,
    { skip: !canSelectSeller }
  );

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        type: "date-range",
        key: "dueFrom",
        toKey: "dueTo",
        label: "Prazo (período)",
      },
      {
        type: "select",
        key: "seller",
        label: "Responsável",
        placeholder: "Toda a empresa",
        // `sellers` é @is_admin: para o vendedor o campo nem existe.
        hidden: !canSelectSeller,
        options: (sellersQuery.data?.pending_sellers.edges ?? [])
          .filter(({ node }) => node.isActive)
          .map(({ node }) => ({ value: node.id, label: node.name })),
      },
    ],
    [canSelectSeller, sellersQuery.data]
  );

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
    failed: !!error && !summary,
    showSkeleton: loading && !summary,
    refetch,
    filterFields,
    filterValues: filters.inputValues,
    queryValues: filters.queryValues,
    setFilters: filters.setFilters,
    currentPage,
    setCurrentPage: filters.setPage,
  };
}
