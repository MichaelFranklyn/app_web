"use client";

import { DocumentNode } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";
import { useCallback } from "react";

/**
 * Estratégias de atualização do cache Apollo (CONVENÇÃO DO PROJETO)
 * =================================================================
 *
 * Depois de uma mutation (create/update/delete), o cache precisa refletir a
 * mudança. Use SEMPRE um destes dois hooks — nunca chame `client.cache.evict`,
 * `client.cache.gc` ou `client.refetchQueries` direto no componente.
 *
 * 1. useInvalidateQueriesClient → EVICT (invalidar para o próximo mount)
 *    Remove o campo do cache; a query refaz o fetch quando for remontada.
 *    Use quando a lista afetada NÃO está visível agora — ex.: você navega para
 *    outra rota logo após a ação (deletar no detalhe e voltar para a lista), ou
 *    está mexendo em dados de background (KPIs de outra tela).
 *    ⚠️ Em uma lista visível, evict causa flicker (some e recarrega).
 *
 * 2. useRefetchQueriesClient → REFETCH (refetch ativo, sem flicker)
 *    Refaz o fetch das queries ativas mantendo os dados antigos na tela até o
 *    novo resultado chegar. Use quando a lista/KPI afetado ESTÁ visível agora
 *    (ex.: criar um pedido na própria tela de pedidos).
 *
 * Para inserção/remoção instantânea (otimista) numa lista visível, prefira
 * `optimisticResponse` + `cache.updateQuery` na própria mutation, com um
 * refetch como rede de segurança. Esse é o único caso em que o cache é tocado
 * fora destes hooks.
 */

/**
 * Invalida campos do cache Apollo por nome (evict + gc).
 *
 * Omitir o `id` faz o evict atingir o ROOT_QUERY, ou seja, invalida apenas o
 * CAMPO da listagem sem remover as entidades — a query refaz o fetch ao
 * remontar.
 *
 * @example
 * const invalidateClient = useInvalidateQueriesClient();
 * await invalidateClient(["orders", "orderStats"]);
 */
export const useInvalidateQueriesClient = () => {
  const apolloClient = useApolloClient();

  return useCallback(
    async (fieldNames: string[]) => {
      if (fieldNames.length > 0) {
        fieldNames.forEach((fieldName) => {
          if (fieldName) {
            apolloClient.cache.evict({ fieldName });
          }
        });
        apolloClient.cache.gc();
      }
    },
    [apolloClient]
  );
};

/**
 * Refaz o fetch de queries ativas mantendo os dados visíveis (sem flicker).
 *
 * Aceita nomes de operação (string) ou o próprio DocumentNode da query.
 *
 * @example
 * const refetchClient = useRefetchQueriesClient();
 * refetchClient(["Orders", "OrderStats"]);
 */
export const useRefetchQueriesClient = () => {
  const apolloClient = useApolloClient();

  return useCallback(
    (operations: (string | DocumentNode)[]) => {
      if (operations.length === 0) return;
      apolloClient.refetchQueries({ include: operations });
    },
    [apolloClient]
  );
};
