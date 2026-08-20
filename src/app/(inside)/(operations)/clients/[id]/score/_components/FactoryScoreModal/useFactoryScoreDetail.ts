"use client";

import { useQuery } from "@apollo/client/react";
import {
  CLIENT_PRODUCT_INSIGHTS_QUERY,
  CLIENT_VISIT_SCORES_QUERY,
} from "../../../gql";
import {
  ClientProductInsightsQueryResponse,
  ClientVisitScoresQueryResponse,
} from "../../../interface";

/**
 * Histórico e produtos sugeridos de UM vínculo (cliente × fábrica).
 *
 * Só busca quando o modal está aberto: um cliente tem dezenas de fábricas e
 * carregar o histórico de todas ao abrir a aba seria desperdício.
 */
export function useFactoryScoreDetail(sellerClientFactoryId: string | null) {
  const skip = !sellerClientFactoryId;

  const { data: historyData, loading: historyLoading } =
    useQuery<ClientVisitScoresQueryResponse>(CLIENT_VISIT_SCORES_QUERY, {
      variables: {
        sellerClientFactoryId,
        input: { order: { by: "score_date", dir: "desc" }, first: 10 },
      },
      skip,
    });

  const { data: insightsData, loading: insightsLoading } =
    useQuery<ClientProductInsightsQueryResponse>(
      CLIENT_PRODUCT_INSIGHTS_QUERY,
      {
        // Os 20 MAIS urgentes, não 20 quaisquer: sem `order` o backend não
        // ordena (ver `_apply_order`), então o produto zerado podia ficar de
        // fora do corte enquanto vinte tranquilos ocupavam a lista — e a tela
        // os chama de "sugeridos para reposição".
        variables: {
          sellerClientFactoryId,
          input: {
            order: { by: "estimated_stockout_date", dir: "asc" },
            first: 20,
          },
        },
        skip,
      }
    );

  return {
    history: historyData?.clientVisitScores.edges.map((e) => e.node) ?? [],
    insights:
      insightsData?.clientProductInsights.edges.map((e) => e.node) ?? [],
    loading: historyLoading || insightsLoading,
  };
}
