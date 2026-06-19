"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { DELETE_ORDER_MUTATION } from "./gql";

interface DeleteOrderResponse {
  deleteOrder: {
    __typename?: "BaseResponse";
    status: boolean;
    message: string;
  };
}

interface Props {
  orderId: string;
  orderCode: string;
  onDeleted?: () => void;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function DeleteOrderModal({
  orderId,
  orderCode,
  onDeleted,
  onRemoveOptimistic,
  onCommit,
  onRollback,
}: Props) {
  const [open, setOpen] = useState(false);
  const [deleteOrder] = useMutation<DeleteOrderResponse>(DELETE_ORDER_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    setOpen(false);
    onRemoveOptimistic(orderId);

    await execute(
      async () => {
        const res = await deleteOrder({ variables: { id: orderId } });
        if (!res.data?.deleteOrder?.status) {
          throw new Error(
            res.data?.deleteOrder?.message ?? "Erro ao remover pedido"
          );
        }
        return res.data.deleteOrder;
      },
      {
        successMessage: "Pedido removido",
        onSuccess: () => {
          onCommit();
          onDeleted?.();
        },
        onError: () => {
          onRollback();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root
          appearance="ghost"
          color="red"
          size="xs"
          aria-label="Remover pedido"
        >
          <Button.Icon icon={Trash2} />
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Remover pedido"
          description={`Remover o pedido ${orderCode}? Esta ação não pode ser desfeita.`}
        />
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              noUppercase
              disabled={isLoading}
            >
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="red"
            size="md"
            noUppercase
            loading={isLoading}
            onClick={handleConfirm}
          >
            <Button.Title>Remover</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
