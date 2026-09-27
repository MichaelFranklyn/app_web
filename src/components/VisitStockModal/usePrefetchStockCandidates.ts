"use client";

import { useIdleReady } from "@/hooks/useIdleReady";
import { useQuery } from "@apollo/client/react";

import { VISIT_STOCK_CANDIDATES_QUERY } from "./gql";

/**
 * Deixa à mão, no cache, os produtos a perguntar numa visita de HOJE.
 *
 * O estoque pode ser registrado sem sinal (fica guardado no aparelho), mas a
 * LISTA de produtos vem do servidor. Dentro da loja o sinal já caiu — é tarde
 * para buscá-la. Carregada enquanto a rotina está aberta com sinal, ela fica no
 * cache e o modal abre mesmo offline.
 *
 * Só as visitas do dia (6 a 10 consultas), e depois de a tela ficar ociosa:
 * a semana inteira seriam dezenas de consultas no carregamento da rotina.
 */
export function usePrefetchStockCandidates(itemId: string, enabled: boolean) {
  const ready = useIdleReady();
  useQuery(VISIT_STOCK_CANDIDATES_QUERY, {
    variables: { itemId },
    skip: !enabled || !ready,
    fetchPolicy: "cache-first",
  });
}
