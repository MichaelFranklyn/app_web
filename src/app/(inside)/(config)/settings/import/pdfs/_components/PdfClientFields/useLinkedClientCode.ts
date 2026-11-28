"use client";

import { useLazyQuery } from "@apollo/client/react";
import { useCallback } from "react";

import { PDF_CLIENT_FACTORY_CODE_QUERY } from "./gql";
import { PdfClientFactoryCodeData } from "./interface";

/**
 * O código que o cliente já tem na fábrica do lote (gravado no vínculo), ou
 * nulo quando não há vínculo, não há código ou a busca falha — aí o campo
 * fica como estava.
 */
export function useLinkedClientCode(factoryId: string) {
  const [fetchLink] = useLazyQuery<PdfClientFactoryCodeData>(
    PDF_CLIENT_FACTORY_CODE_QUERY,
    { fetchPolicy: "network-only" }
  );

  return useCallback(
    async (clientId: string): Promise<string | null> => {
      try {
        const { data } = await fetchLink({
          variables: {
            input: {
              first: 1,
              filters: [
                { field: "client_id", operator: "eq", value: clientId },
                { field: "factory_id", operator: "eq", value: factoryId },
              ],
            },
          },
        });
        const code =
          data?.sellerClientFactoryList.edges[0]?.node.factoryClientCode;
        return code?.trim() || null;
      } catch {
        return null;
      }
    },
    [fetchLink, factoryId]
  );
}
