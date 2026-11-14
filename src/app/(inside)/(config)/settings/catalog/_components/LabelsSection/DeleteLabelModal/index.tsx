"use client";

import type { CatalogModalControl } from "../../../interface";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useMutation } from "@apollo/client/react";
import { DELETE_PRODUCT_UNIT_LABEL_MUTATION } from "../../../gql";
import {
  DeleteLabelModalProps,
  DeleteProductUnitLabelResponse,
} from "./interface";

export function DeleteLabelModal({
  labelId,
  labelText,
  onRemoveOptimistic,
  onCommit,
  onRollback,
  onDone,
  open,
  onOpenChange,
}: DeleteLabelModalProps & CatalogModalControl) {
  const [deleteLabel] = useMutation<DeleteProductUnitLabelResponse>(
    DELETE_PRODUCT_UNIT_LABEL_MUTATION
  );

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Remover rótulo"
      description={`Tem certeza que deseja remover o rótulo "${labelText}"?`}
      confirmLabel="Remover"
      successMessage="Rótulo removido"
      onBeforeConfirm={() => onRemoveOptimistic(labelId)}
      onConfirm={async () => {
        const res = await deleteLabel({ variables: { id: labelId } });
        if (!res.data?.deleteProductUnitLabel?.status) {
          throw new Error(
            res.data?.deleteProductUnitLabel?.message ??
              "Erro ao remover rótulo"
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
