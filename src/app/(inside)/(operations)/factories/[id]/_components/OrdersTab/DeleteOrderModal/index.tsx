"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { DELETE_ORDER_MUTATION } from "./gql";
import { DeleteOrderModalProps, DeleteOrderResponse } from "./interface";

export function DeleteOrderModal({
  orderId,
  orderCode,
  onRemoveOptimistic,
  onCommit,
  onRollback,
}: DeleteOrderModalProps) {
  const invalidateClient = useInvalidateQueriesClient();
  const [deleteOrder] = useMutation<DeleteOrderResponse>(DELETE_ORDER_MUTATION);

  return (
    <ConfirmModal
      trigger={
        <Button.Root
          appearance="ghost"
          color="red"
          size="xs"
          isIconOnly
          aria-label="Remover pedido"
          onClick={(e) => e.stopPropagation()}
        >
          <Button.Icon icon={Trash2} />
        </Button.Root>
      }
      title="Remover pedido"
      description={`Remover o pedido ${orderCode}? Ele sai das listas e dos totais da fábrica. Esta ação não pode ser desfeita.`}
      confirmLabel="Remover"
      successMessage="Pedido removido"
      onBeforeConfirm={() => onRemoveOptimistic(orderId)}
      onConfirm={async () => {
        const res = await deleteOrder({ variables: { id: orderId } });
        if (!res.data?.deleteOrder?.status) {
          throw new Error(
            res.data?.deleteOrder?.message ?? "Erro ao remover pedido"
          );
        }
      }}
      onSuccess={() => {
        onCommit();
        void invalidateClient(["orders"]);
      }}
      onError={onRollback}
    />
  );
}
