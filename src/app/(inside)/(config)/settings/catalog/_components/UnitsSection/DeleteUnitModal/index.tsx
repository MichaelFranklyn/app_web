"use client";

import type { CatalogModalControl } from "../../../interface";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useMutation } from "@apollo/client/react";
import { DELETE_PRODUCT_UNIT_MUTATION } from "../../../gql";
import { DeleteProductUnitResponse, DeleteUnitModalProps } from "./interface";

export function DeleteUnitModal({
  unitId,
  unitLabel,
  onRemoveOptimistic,
  onCommit,
  onRollback,
  onDone,
  open,
  onOpenChange,
}: DeleteUnitModalProps & CatalogModalControl) {
  const [deleteUnit] = useMutation<DeleteProductUnitResponse>(
    DELETE_PRODUCT_UNIT_MUTATION
  );

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Remover unidade"
      description={`Tem certeza que deseja remover a unidade "${unitLabel}"?`}
      confirmLabel="Remover"
      successMessage="Unidade removida"
      onBeforeConfirm={() => onRemoveOptimistic(unitId)}
      onConfirm={async () => {
        const res = await deleteUnit({ variables: { id: unitId } });
        if (!res.data?.deleteProductUnit?.status) {
          throw new Error(
            res.data?.deleteProductUnit?.message ?? "Erro ao remover unidade"
          );
        }
      }}
      onSuccess={() => {
        onCommit();
        onDone();
      }}
      onError={onRollback}
    />
  );
}
