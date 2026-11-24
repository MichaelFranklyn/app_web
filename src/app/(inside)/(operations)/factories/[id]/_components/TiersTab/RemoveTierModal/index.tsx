"use client";

import { ConfirmModal } from "@/components/ConfirmModal";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { PRICE_TIER_CACHE_FIELDS } from "@/utils/cacheFields";
import { useMutation } from "@apollo/client/react";
import { DELETE_PRICE_TIER_MUTATION } from "../gql";

interface DeleteTierResponse {
  deletePriceTier: {
    __typename?: "BaseResponse";
    status: boolean;
    message: string;
  };
}

interface Props {
  /** Controlado: o gatilho mora fora (o "⋯"/ícone da linha, em RowActions). */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tierId: string;
  tierName: string;
  onRemoved: () => void;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function RemoveTierModal({
  tierId,
  tierName,
  onRemoved,
  onRemoveOptimistic,
  onCommit,
  onRollback,
  open,
  onOpenChange,
}: Props) {
  const [deleteTier] = useMutation<DeleteTierResponse>(
    DELETE_PRICE_TIER_MUTATION
  );
  const invalidateClient = useInvalidateQueriesClient();

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Remover nível"
      description={`Remover o nível comercial "${tierName}"? Preços vinculados a ele também deixam de existir.`}
      confirmLabel="Remover"
      successMessage="Nível removido"
      onBeforeConfirm={() => onRemoveOptimistic(tierId)}
      onConfirm={async () => {
        const res = await deleteTier({ variables: { id: tierId } });
        if (!res.data?.deletePriceTier?.status) {
          throw new Error(
            res.data?.deletePriceTier?.message ?? "Erro ao remover nível"
          );
        }
      }}
      onSuccess={() => {
        onCommit();
        onRemoved();
        // O nível sai também dos selects de preço, pedido e vínculo.
        void invalidateClient(PRICE_TIER_CACHE_FIELDS);
      }}
      onError={onRollback}
    />
  );
}
