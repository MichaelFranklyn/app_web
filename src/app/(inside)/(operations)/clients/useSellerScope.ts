"use client";

import { SelectOption } from "@/components/Input";
import { useIdleReady } from "@/hooks/useIdleReady";
import { useCompleteList } from "@/hooks/useCompleteList";
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
// Catálogo pequeno carregado por inteiro (ver useCompleteList).
const EMPTY_INPUT = {};
const getClientsSellers = (d: ClientsSellersResponse) => d.clients_sellers;

export function useSellerScope({
  canFilterBySeller,
  selectedSellerId,
  fallbackStats,
}: UseSellerScopeParams) {
  // A lista de vendedores só preenche o seletor do painel de filtros: espera a
  // carga da página terminar em vez de disputar a rede com a tabela.
  const idleReady = useIdleReady();

  const sellersQuery = useCompleteList<ClientsSellersResponse>(
    CLIENTS_SELLERS_QUERY,
    EMPTY_INPUT,
    getClientsSellers,
    { skip: !canFilterBySeller || !idleReady }
  );

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

  // Enquanto a busca está represada o seletor precisa parecer "carregando", e
  // não "sem vendedores": `loading` do Apollo é false enquanto a query está skipada.
  const sellersLoading =
    canFilterBySeller && (!idleReady || sellersQuery.loading);

  return { sellerOptions, sellersLoading, stats };
}
