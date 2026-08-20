"use client";

import { useCompleteList } from "@/hooks/useCompleteList";
import { useMemo } from "react";
import { SELLER_CLIENT_FACTORIES_QUERY } from "./gql";
import {
  SellerClientFactoriesQueryResponse,
  SellerClientFactory,
} from "./interface";

const getConnection = (d: SellerClientFactoriesQueryResponse) =>
  d.sellerClientFactoryList;

/**
 * As fábricas que este cliente compra, com o vendedor e a cadência de cada uma.
 *
 * Mora no pai porque duas abas fazem a MESMA busca: a de Fábricas, que a mostra
 * inteira, e a Visão Geral, que dela tira só a data da última visita. Com as
 * variáveis idênticas as duas dividem uma resposta no cache do Apollo — trocar
 * de aba não volta à rede. Escrita em dois lugares, bastava alguém mexer numa
 * para elas divergirem e a segunda busca renascer.
 *
 * `useCompleteList` no lugar do `first: 50` que estava fixo nas duas: cinquenta
 * dá para praticamente todo cliente, e é justamente por isso que o dia em que
 * não desse passaria despercebido — a aba mostraria 50 vínculos de 53 sem nada
 * na tela dizendo que faltavam três. O hook confere o `totalCount` e rebusca
 * pelo total quando ele passa do que veio.
 */
export function useClientFactoryLinks(clientId: string) {
  const input = useMemo(
    () => ({
      filters: [{ field: "client_id", operator: "eq", value: clientId }],
    }),
    [clientId]
  );

  const { data, loading, error, refetch, isComplete } =
    useCompleteList<SellerClientFactoriesQueryResponse>(
      SELLER_CLIENT_FACTORIES_QUERY,
      input,
      getConnection,
      { skip: !clientId }
    );

  const links = useMemo<SellerClientFactory[]>(
    () => data?.sellerClientFactoryList.edges.map((e) => e.node) ?? [],
    [data]
  );

  return { links, loading, error, refetch, isComplete };
}
