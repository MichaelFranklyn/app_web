"use client";

import { ConfirmModal } from "@/components/ConfirmModal";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { PRICE_ITEM_CACHE_FIELDS } from "@/utils/cacheFields";
import { useMutation } from "@apollo/client/react";
import { DELETE_PRICE_LIST_ITEM_MUTATION } from "./gql";

interface DeleteResponse {
  deletePriceListItem: { status: boolean; message: string };
}

interface Props {
  itemId: string;
  productName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function DeleteItemModal({
  itemId,
  productName,
  open,
  onOpenChange,
  onDeleted,
  onRemoveOptimistic,
  onCommit,
  onRollback,
}: Props) {
  const [deleteItem] = useMutation<DeleteResponse>(
    DELETE_PRICE_LIST_ITEM_MUTATION
  );
  const invalidateClient = useInvalidateQueriesClient();

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Remover item"
      description={`Remover o item de "${productName}" desta tabela?`}
      confirmLabel="Remover"
      successMessage="Item removido"
      onBeforeConfirm={() => onRemoveOptimistic(itemId)}
      onConfirm={async () => {
        const res = await deleteItem({ variables: { id: itemId } });
        if (!res.data?.deletePriceListItem?.status) {
          throw new Error(
            res.data?.deletePriceListItem?.message ?? "Erro ao remover item"
          );
        }
      }}
      onSuccess={() => {
        onCommit();
        onDeleted();
        // A ficha do produto lista o mesmo preço por outro caminho de cache.
        void invalidateClient(PRICE_ITEM_CACHE_FIELDS);
      }}
      onError={onRollback}
    />
  );
}
