"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { DELETE_PRICE_TIER_MUTATION } from "../gql";

interface DeleteTierResponse {
  deletePriceTier: {
    __typename?: "BaseResponse";
    status: boolean;
    message: string;
  };
}

interface Props {
  tierId: string;
  tierName: string;
  onRemoved: () => void;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function RemoveTierModal({
  tierId,
  tierName,
  onRemoved,
  onRemoveOptimistic,
  onCommit,
  onRollback,
}: Props) {
  const [open, setOpen] = useState(false);
  const [deleteTier] = useMutation<DeleteTierResponse>(
    DELETE_PRICE_TIER_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    setOpen(false);
    onRemoveOptimistic(tierId);

    await execute(
      async () => {
        const res = await deleteTier({ variables: { id: tierId } });
        if (!res.data?.deletePriceTier?.status) {
          throw new Error(
            res.data?.deletePriceTier?.message ?? "Erro ao remover nível"
          );
        }
        return res.data.deletePriceTier;
      },
      {
        successMessage: "Nível removido",
        onSuccess: async () => {
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
          title="Remover nível"
          description={`Remover o nível comercial "${tierName}"? Preços vinculados a ele também deixam de existir.`}
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
