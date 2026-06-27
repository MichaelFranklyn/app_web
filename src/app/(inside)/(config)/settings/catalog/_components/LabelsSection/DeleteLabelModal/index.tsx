"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
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
}: DeleteLabelModalProps) {
  const [deleteLabel] = useMutation<DeleteProductUnitLabelResponse>(
    DELETE_PRODUCT_UNIT_LABEL_MUTATION
  );

  return (
    <ConfirmModal
      trigger={
        <Button.Root appearance="ghost" color="red" size="sm" isIconOnly>
          <Button.Icon icon={Trash2} />
        </Button.Root>
      }
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
