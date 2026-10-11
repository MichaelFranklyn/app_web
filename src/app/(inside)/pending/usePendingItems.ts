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
  PendingSection,
  PendingSellersResponse,
  PendingWhen,
} from "./interface";
import {
  ITEMS_PER_PAGE,
  PENDING_FILTER_FIELDS,
  pendingTypeOptions,
  pendingVariables,
  sectionCounts,
  sectionOf,
} from "./utils";

const EMPTY_INPUT = {};
const getSellers = (d: PendingSellersResponse) => d.pending_sellers;

/**
 * O estado da central: filtros e página na URL, lista e contadores do backend.
 *
 * Na URL, e não em `useState`, porque esta é uma lista de TRABALHO: a pessoa
 * abre um pedido, resolve, e volta — e tem de cair no mesmo filtro e na mesma
 * página, agora com uma linha a menos.
 */
export function usePendingItems({
  canSelectSeller,
  seed,
}: PendingContentProps) {
  const filters = useTableFilters(PENDING_FILTER_FIELDS);
  const searchParams = useSearchParams();
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

  useSeedQuery([
    {
      query: MY_PENDING_ITEMS_QUERY,
      variables: pendingVariables({}, 1, canSelectSeller),
      data: seed,
    },
  ]);

  const variables = useMemo(
    () => pendingVariables(filters.queryValues, currentPage, canSelectSeller),
    [filters.queryValues, currentPage, canSelectSeller]
  );

  const { data, previousData, loading, error, refetch } =
    useQuery<MyPendingItemsResponse>(MY_PENDING_ITEMS_QUERY, {
      variables,
      // A leitura é do momento: quem resolveu uma pendência e voltou tem de ver
      // a lista menor, não a foto de quando abriu a tela.
      fetchPolicy: "cache-and-network",
    });

  // Enquanto o filtro novo carrega, a lista anterior continua na tela — trocar
  // tudo por esqueleto a cada clique faz a tabela piscar e perder a posição.
  const page = (data ?? previousData)?.myPendingItems?.data ?? null;

  const sellersQuery = useCompleteList<PendingSellersResponse>(
    PENDING_SELLERS_QUERY,
    EMPTY_INPUT,
    getSellers,
    { skip: !canSelectSeller }
  );

  const typeCounts = page?.counts;
  const section = sectionOf(filters.inputValues);
  const filterFields: FilterField[] = useMemo(
    () => [
      {
        type: "select",
        key: "type",
        label: "Tipo de pendência",
        placeholder: "Todos os tipos",
        // Com a contagem no rótulo: "Pedidos parados (3)" diz antes do clique
        // se vale a pena filtrar. Em Cobranças há um tipo só: some o campo.
        hidden: section === "charges",
        options: pendingTypeOptions(typeCounts),
      },
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
    [canSelectSeller, sellersQuery.data, typeCounts, section]
  );

  /** Trocar de seção zera o tipo: o tipo de uma seção não existe na outra. */
  const changeSection = (next: PendingSection) =>
    filters.setFilters({
      section: next === "charges" ? "charges" : undefined,
      type: undefined,
    });

  const activeWhen = (filters.inputValues.when || null) as PendingWhen | null;
  /** O contador clicado vira filtro; clicar no ativo de novo desfaz. */
  const toggleWhen = (when: PendingWhen) =>
    filters.setFilters({ when: activeWhen === when ? undefined : when });

  const totalItems = page?.totalCount ?? 0;

  return {
    page,
    items: page?.items ?? [],
    counts: page?.counts ?? [],
    whenCounts: page?.whenCounts ?? [],
    section,
    sectionTotals: sectionCounts(page?.counts ?? []),
    changeSection,
    activeWhen,
    toggleWhen,
    loading,
    /** Erro sem nada para mostrar — com dado em tela, a falha não o apaga. */
    failed: !!error && !page,
    showSkeleton: loading && !page,
    refetch,
    filterFields,
    filterValues: filters.inputValues,
    setFilters: filters.setFilters,
    currentPage,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE)),
    setCurrentPage: filters.setPage,
  };
}
