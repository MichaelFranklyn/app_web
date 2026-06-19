"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { DELETE_PRICE_LIST_ITEM_MUTATION } from "../gql";

interface DeletePriceItemResponse {
  deletePriceListItem: { status: boolean; message: string };
}

interface Props {
  priceItemId: string;
  label: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemoved: () => void;
}

export function RemovePriceItemModal({
  priceItemId,
  label,
  open,
  onOpenChange,
  onRemoved,
}: Props) {
  const [deletePriceItem] = useMutation<DeletePriceItemResponse>(
    DELETE_PRICE_LIST_ITEM_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    await execute(
      async () => {
        const res = await deletePriceItem({ variables: { id: priceItemId } });
        if (!res.data?.deletePriceListItem?.status) {
          throw new Error(
            res.data?.deletePriceListItem?.message ?? "Erro ao remover preço"
          );
        }
        return res.data.deletePriceListItem;
      },
      {
        successMessage: "Preço removido",
        onSuccess: async () => {
          onOpenChange(false);
          onRemoved();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title="Remover preço"
          description={`Remover o preço de "${label}" deste produto?`}
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
