"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { OrderItem } from "../../../interface";
import { DELETE_ORDER_ITEM_MUTATION } from "../gql";

interface DeleteOrderItemResponse {
  deleteOrderItem: {
    status: boolean;
    message: string;
  };
}

interface Props {
  /** Controlado: o gatilho mora fora (o "⋯"/ícone da linha, em RowActions). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  item: OrderItem;
  onOptimisticRemove: (id: string) => void;
  onRollback: () => void;
  onRefetch: () => void;
}

export function DeleteOrderItemModal({
  item,
  onOptimisticRemove,
  onRollback,
  onRefetch,
  open: controlledOpen,
  onOpenChange,
}: Props) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (value: boolean) => {
    if (isControlled) onOpenChange?.(value);
    else setUncontrolledOpen(value);
  };

  const [deleteOrderItem] = useMutation<DeleteOrderItemResponse>(
    DELETE_ORDER_ITEM_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    onOptimisticRemove(item.id);
    setOpen(false);

    await execute(
      async () => {
        const res = await deleteOrderItem({ variables: { id: item.id } });
        if (!res.data?.deleteOrderItem?.status) {
          throw new Error(
            res.data?.deleteOrderItem?.message ?? "Erro ao remover item"
          );
        }
        return res.data.deleteOrderItem;
      },
      {
        successMessage: "Item removido do pedido",
        onSuccess: () => onRefetch(),
        onError: () => onRollback(),
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <Modal.Trigger asChild>
          <Button.Root
            appearance="ghost"
            color="red"
            size="sm"
            isIconOnly
            aria-label="Remover item"
          >
            <Button.Icon icon={Trash2} />
          </Button.Root>
        </Modal.Trigger>
      )}

      <Modal.Content size="sm">
        <Modal.Header
          title="Remover item"
          description={`Remover "${item.product?.name ?? "este item"}" do pedido? Esta ação não pode ser desfeita.`}
        />

        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              disabled={isLoading}
            >
              <Button.Title>Voltar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="red"
            size="md"
            loading={isLoading}
            onClick={handleConfirm}
          >
            <Button.Title>Remover item</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
