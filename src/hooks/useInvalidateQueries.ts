"use client";

import { useApolloClient } from "@apollo/client/react";

/**
 * Hook para invalidar Apollo cache (cliente)
 *
 * Usa o mapa centralizado em @/services/graphql/apollo-cache.ts
 *
 * @returns Função que invalida Apollo queries
 *
 * @example
 * const invalidateClient = useInvalidateQueriesClient();
 * await invalidateClient(['clients_list']);
 */
export const useInvalidateQueriesClient = () => {
  const apolloClient = useApolloClient();

  return async (queries: string[]) => {
    const tags = queries;

    if (tags.length > 0) {
      tags.forEach((tag) => {
        const fieldName = tag;
        if (fieldName) {
          apolloClient.cache.evict({ fieldName });
        }
      });
      apolloClient.cache.gc();
    }
  };
};
