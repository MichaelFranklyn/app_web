"use client";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { CLIENT_STOCK_CACHE_FIELDS } from "@/utils/cacheFields";
import { useMutation } from "@apollo/client/react";
import { UPDATE_PRODUCT_STOCK_MUTATION } from "../../../gql";
import { UpdateProductStockResponse } from "../../../interface";

/**
 * Registra o estoque de um produto FORA de uma visita (telefonema).
 *
 * O `sellerClientFactoryId` vem do card de fábrica aberto; o backend corrige a
 * previsão de esgotamento e recalcula o score do vínculo na hora. Ao concluir,
 * chama `onSaved` para a tabela recarregar a estimativa atualizada.
 */
export function useUpdateProductStock(
  sellerClientFactoryId: string | null,
  onSaved: () => void
) {
  const { execute, isLoading } = useAsyncAction();
  const invalidateClient = useInvalidateQueriesClient();
  const [mutate] = useMutation<UpdateProductStockResponse>(
    UPDATE_PRODUCT_STOCK_MUTATION
  );

  const save = async (productId: string, daysRemaining: number | null) => {
    if (!sellerClientFactoryId) return;

    await execute(
      async () => {
        const res = await mutate({
          variables: { sellerClientFactoryId, productId, daysRemaining },
        });
        if (!res.data?.updateProductStock?.status) {
          throw new Error(
            res.data?.updateProductStock?.message ?? "Erro ao atualizar estoque"
          );
        }
        return res.data.updateProductStock.data;
      },
      {
        successMessage: "Estoque atualizado com sucesso",
        onSuccess: async () => {
          onSaved();
          // O backend corrigiu a previsão de esgotamento e recalculou o score:
          // a mesma lista da observação de estoque da visita.
          await invalidateClient(CLIENT_STOCK_CACHE_FIELDS);
        },
      }
    );
  };

  return { save, isLoading };
}
