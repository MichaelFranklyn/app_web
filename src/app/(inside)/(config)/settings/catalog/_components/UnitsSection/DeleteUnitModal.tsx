"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { DELETE_PRODUCT_UNIT_MUTATION } from "../../gql";

interface Props {
  unitId: string;
  unitLabel: string;
  onDone: () => void;
}

export function DeleteUnitModal({ unitId, unitLabel, onDone }: Props) {
  const [open, setOpen] = useState(false);
  const [deleteUnit] = useMutation<{
    deleteProductUnit: { status: boolean; message: string };
  }>(DELETE_PRODUCT_UNIT_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    await execute(
      async () => {
        const res = await deleteUnit({ variables: { id: unitId } });
        if (!res.data?.deleteProductUnit?.status) {
          throw new Error(
            res.data?.deleteProductUnit?.message ?? "Erro ao remover unidade"
          );
        }
        return res.data.deleteProductUnit;
      },
      {
        successMessage: "Unidade removida",
        onSuccess: () => {
          setOpen(false);
          onDone();
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
          title="Remover unidade"
          description={`Tem certeza que deseja remover a unidade "${unitLabel}"?`}
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
