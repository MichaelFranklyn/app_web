"use client";

import { ConfirmModal } from "@/components/ConfirmModal";
import { useMutation } from "@apollo/client/react";
import { DELETE_PRICE_LIST_ITEM_MUTATION } from "../gql";

interface DeletePriceItemResponse {
  deletePriceListItem: { status: boolean; message: string };
}

interface Props {
  priceItemId: string;
  label: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemoved: () => void;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function RemovePriceItemModal({
  priceItemId,
  label,
  open,
  onOpenChange,
  onRemoved,
  onRemoveOptimistic,
  onCommit,
  onRollback,
}: Props) {
  const [deletePriceItem] = useMutation<DeletePriceItemResponse>(
    DELETE_PRICE_LIST_ITEM_MUTATION
  );

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Remover preço"
      description={`Remover o preço de "${label}" deste produto?`}
      confirmLabel="Remover"
      successMessage="Preço removido"
      onBeforeConfirm={() => onRemoveOptimistic(priceItemId)}
      onConfirm={async () => {
        const res = await deletePriceItem({ variables: { id: priceItemId } });
        if (!res.data?.deletePriceListItem?.status) {
          throw new Error(
            res.data?.deletePriceListItem?.message ?? "Erro ao remover preço"
          );
        }
      }}
      onSuccess={() => {
        onCommit();
        onRemoved();
      }}
      onError={onRollback}
    />
  );
}
