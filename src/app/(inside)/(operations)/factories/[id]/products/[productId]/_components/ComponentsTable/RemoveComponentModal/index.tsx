"use client";

import { ConfirmModal } from "@/components/ConfirmModal";
import { useMutation } from "@apollo/client/react";
import { REMOVE_COMPONENT_FROM_PRODUCT_MUTATION } from "../gql";
import { RemoveComponentResponse } from "../interface";

interface Props {
  /** Controlado: o gatilho é o "⋯" da linha (RowActions). */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  componentId: string;
  componentName: string;
  onRemoved: () => void;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function RemoveComponentModal({
  open,
  onOpenChange,
  componentId,
  componentName,
  onRemoved,
  onRemoveOptimistic,
  onCommit,
  onRollback,
}: Props) {
  const [removeComponent] = useMutation<RemoveComponentResponse>(
    REMOVE_COMPONENT_FROM_PRODUCT_MUTATION
  );

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Remover componente"
      description={`Remover "${componentName}" da composição deste kit?`}
      confirmLabel="Remover"
      successMessage="Componente removido do kit"
      onBeforeConfirm={() => onRemoveOptimistic(componentId)}
      onConfirm={async () => {
        const res = await removeComponent({ variables: { id: componentId } });
        if (!res.data?.removeComponentFromProduct?.status) {
          throw new Error(
            res.data?.removeComponentFromProduct?.message ??
              "Erro ao remover componente"
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
