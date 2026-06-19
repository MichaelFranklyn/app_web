"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
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
}

export function DeleteItemModal({
  itemId,
  productName,
  open,
  onOpenChange,
  onDeleted,
}: Props) {
  const [deleteItem] = useMutation<DeleteResponse>(
    DELETE_PRICE_LIST_ITEM_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    await execute(
      async () => {
        const res = await deleteItem({ variables: { id: itemId } });
        if (!res.data?.deletePriceListItem?.status) {
          throw new Error(
            res.data?.deletePriceListItem?.message ?? "Erro ao remover item"
          );
        }
        return res.data.deletePriceListItem;
      },
      {
        successMessage: "Item removido",
        onSuccess: async () => {
          onOpenChange(false);
          onDeleted();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title="Remover item"
          description={`Remover o item de "${productName}" desta tabela?`}
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
