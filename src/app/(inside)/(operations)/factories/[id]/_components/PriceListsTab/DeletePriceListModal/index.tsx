"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { DELETE_FACTORY_PRICE_LIST_MUTATION } from "../gql";

interface DeletePriceListResponse {
  deleteFactoryPriceList: {
    __typename?: "BaseResponse";
    status: boolean;
    message: string;
  };
}

interface Props {
  priceListId: string;
  priceListName: string;
  onRemoved: () => void;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function DeletePriceListModal({
  priceListId,
  priceListName,
  onRemoved,
  onRemoveOptimistic,
  onCommit,
  onRollback,
}: Props) {
  const [open, setOpen] = useState(false);
  const [deletePriceList] = useMutation<DeletePriceListResponse>(
    DELETE_FACTORY_PRICE_LIST_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    setOpen(false);
    onRemoveOptimistic(priceListId);

    await execute(
      async () => {
        const res = await deletePriceList({ variables: { id: priceListId } });
        if (!res.data?.deleteFactoryPriceList?.status) {
          throw new Error(
            res.data?.deleteFactoryPriceList?.message ??
              "Erro ao remover tabela de preço"
          );
        }
        return res.data.deleteFactoryPriceList;
      },
      {
        successMessage: "Tabela de preço removida",
        onSuccess: () => {
          onCommit();
          onRemoved();
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
        <Button.Root appearance="ghost" color="red" size="sm" isIconOnly>
          <Button.Icon icon={Trash2} />
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Remover tabela de preço"
          description={`Remover a tabela "${priceListName}"? Todos os preços lançados nela também serão removidos.`}
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
