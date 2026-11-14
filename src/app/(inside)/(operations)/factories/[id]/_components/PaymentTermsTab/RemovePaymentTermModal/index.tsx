"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { DELETE_FACTORY_PAYMENT_TERM_MUTATION } from "../gql";

interface DeleteResponse {
  deleteFactoryPaymentTerm: {
    status: boolean;
    message: string;
  };
}

interface Props {
  /** Controlado: o gatilho mora fora (o "⋯"/ícone da linha, em RowActions). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  termId: string;
  termName: string;
  onRemoved: () => void;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function RemovePaymentTermModal({
  termId,
  termName,
  onRemoved,
  onRemoveOptimistic,
  onCommit,
  onRollback,
  open,
  onOpenChange,
}: Props) {
  const [deleteTerm] = useMutation<DeleteResponse>(
    DELETE_FACTORY_PAYMENT_TERM_MUTATION
  );

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      trigger={
        open === undefined && (
          <Button.Root
            appearance="ghost"
            color="red"
            size="sm"
            isIconOnly
            label="Remover prazo"
          >
            <Button.Icon icon={Trash2} />
          </Button.Root>
        )
      }
      title="Remover prazo"
      description={`Remover o prazo de pagamento "${termName}"? Pedidos já criados não são afetados.`}
      confirmLabel="Remover"
      successMessage="Prazo removido"
      onBeforeConfirm={() => onRemoveOptimistic(termId)}
      onConfirm={async () => {
        const res = await deleteTerm({ variables: { id: termId } });
        if (!res.data?.deleteFactoryPaymentTerm?.status) {
          throw new Error(
            res.data?.deleteFactoryPaymentTerm?.message ??
              "Erro ao remover prazo"
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
