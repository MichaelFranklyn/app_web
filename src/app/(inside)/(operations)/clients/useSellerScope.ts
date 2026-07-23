"use client";

import { SelectOption } from "@/components/Input";
import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";
import { CLIENTS_SELLERS_QUERY, CLIENT_STATS_QUERY } from "./gql";
import { ClientsSellersResponse, ClientsStats } from "./interface";

interface UseSellerScopeParams {
  /** Só gestor escolhe o vendedor; vendedor logado já vê apenas a própria carteira. */
  canFilterBySeller: boolean;
  /** Vendedor escolhido (vem do filtro da tabela, que vive na URL). */
  selectedSellerId: string | null;
  /** KPIs da carteira inteira, buscados no SSR. */
  fallbackStats: ClientsStats;
}

/**
 * Filtro "de qual vendedor" da carteira: a lista de vendedores para o seletor e
 * os KPIs no mesmo recorte da tabela.
 *
 * Sem isto, filtrar a tabela por um vendedor deixaria o topo da página contando
 * a empresa inteira — dois números diferentes na mesma tela.
 */
export function useSellerScope({
  canFilterBySeller,
  selectedSellerId,
  fallbackStats,
}: UseSellerScopeParams) {
  const sellersQuery = useQuery<ClientsSellersResponse>(CLIENTS_SELLERS_QUERY, {
    variables: { input: { first: 200 } },
    skip: !canFilterBySeller,
  });

  const sellerOptions: SelectOption[] = useMemo(
    () =>
      sellersQuery.data?.clients_sellers.edges.map(({ node }) => ({
        value: node.id,
        label: node.name,
      })) ?? [],
    [sellersQuery.data]
  );

  // Sem vendedor escolhido não refaz a query: os KPIs do SSR já são os certos.
  const statsQuery = useQuery<ClientsStats>(CLIENT_STATS_QUERY, {
    variables: { sellerId: selectedSellerId },
    skip: !selectedSellerId,
  });

  const stats =
    selectedSellerId && statsQuery.data ? statsQuery.data : fallbackStats;

  return { sellerOptions, stats };
}
