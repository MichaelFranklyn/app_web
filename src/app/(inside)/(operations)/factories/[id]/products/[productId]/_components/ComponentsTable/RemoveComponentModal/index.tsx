"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { REMOVE_COMPONENT_FROM_PRODUCT_MUTATION } from "../gql";
import { RemoveComponentResponse } from "../interface";

interface Props {
  componentId: string;
  componentName: string;
  onRemoved: () => void;
}

export function RemoveComponentModal({
  componentId,
  componentName,
  onRemoved,
}: Props) {
  const [open, setOpen] = useState(false);
  const [removeComponent] = useMutation<RemoveComponentResponse>(
    REMOVE_COMPONENT_FROM_PRODUCT_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    await execute(
      async () => {
        const res = await removeComponent({ variables: { id: componentId } });
        if (!res.data?.removeComponentFromProduct?.status) {
          throw new Error(
            res.data?.removeComponentFromProduct?.message ??
              "Erro ao remover componente"
          );
        }
        return res.data.removeComponentFromProduct;
      },
      {
        successMessage: "Componente removido do kit",
        onSuccess: async () => {
          setOpen(false);
          onRemoved();
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
          title="Remover componente"
          description={`Remover "${componentName}" da composição deste kit?`}
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
