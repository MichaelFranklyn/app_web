"use client";

import { useQuery } from "@apollo/client/react";

import { PLAN_CATALOG_QUERY } from "./gql";
import { PlanCatalogEntry, PlanCatalogQueryData } from "./interface";

/**
 * O catálogo de planos, para as telas de plataforma.
 *
 * Fica no PAI porque duas irmãs o consomem — a referência `/platform/plans` e o
 * modal de troca de plano da ficha da empresa. `cache-first` porque a matriz é
 * constante no backend: uma busca por sessão basta.
 */
export function usePlanCatalog() {
  const { data, loading, error, refetch } = useQuery<PlanCatalogQueryData>(
    PLAN_CATALOG_QUERY,
    { fetchPolicy: "cache-first" }
  );

  const plans: PlanCatalogEntry[] = data?.planCatalog?.data ?? [];

  return {
    plans,
    /** O plano de um código, quando existe. Dado legado aponta para plano que
     * saiu do catálogo — daí o nulo em vez de um estouro. */
    findPlan: (code: string | null | undefined) =>
      plans.find((plan) => plan.code === code) ?? null,
    loading,
    error,
    refetch,
  };
}
