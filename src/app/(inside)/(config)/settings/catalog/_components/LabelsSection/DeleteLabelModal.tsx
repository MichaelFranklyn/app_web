"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { DELETE_PRODUCT_UNIT_LABEL_MUTATION } from "../../gql";

interface Props {
  labelId: string;
  labelText: string;
  onDone: () => void;
}

export function DeleteLabelModal({ labelId, labelText, onDone }: Props) {
  const [open, setOpen] = useState(false);
  const [deleteLabel] = useMutation<{
    deleteProductUnitLabel: { status: boolean; message: string };
  }>(DELETE_PRODUCT_UNIT_LABEL_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    await execute(
      async () => {
        const res = await deleteLabel({ variables: { id: labelId } });
        if (!res.data?.deleteProductUnitLabel?.status) {
          throw new Error(
            res.data?.deleteProductUnitLabel?.message ?? "Erro ao remover rótulo"
          );
        }
        return res.data.deleteProductUnitLabel;
      },
      {
        successMessage: "Rótulo removido",
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
          title="Remover rótulo"
          description={`Tem certeza que deseja remover o rótulo "${labelText}"?`}
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
