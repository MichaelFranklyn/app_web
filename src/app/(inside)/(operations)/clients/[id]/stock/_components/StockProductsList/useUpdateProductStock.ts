"use client";

import { useAsyncAction } from "@/hooks/useAsyncAction";
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
  const [mutate] = useMutation<UpdateProductStockResponse>(
    UPDATE_PRODUCT_STOCK_MUTATION,
    {
      // O estoque mudou → o backend corrigiu a previsão de esgotamento e recalculou
      // o score do vínculo. Invalida os campos que exibem esses dados para que
      // recarreguem: os cards de estoque e o score/insights (aba e header) viviam
      // sob `companyClient`, o histórico do score sob `clientVisitScores` e a
      // coluna de score da lista de clientes sob `clients` (visitScoreTotal).
      // Sem isto, trocar de aba (ou voltar à lista) mostrava o número velho.
      update(cache) {
        cache.evict({ id: "ROOT_QUERY", fieldName: "companyClient" });
        cache.evict({ id: "ROOT_QUERY", fieldName: "clientVisitScores" });
        cache.evict({ id: "ROOT_QUERY", fieldName: "clients" });
        cache.gc();
      },
    }
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
        onSuccess: () => onSaved(),
      }
    );
  };

  return { save, isLoading };
}
