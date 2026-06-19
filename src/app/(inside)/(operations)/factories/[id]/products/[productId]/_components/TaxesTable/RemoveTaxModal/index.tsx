"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { REMOVE_TAX_FROM_PRODUCT_MUTATION } from "../gql";

interface RemoveTaxResponse {
  removeTaxFromProduct: { status: boolean; message: string };
}

interface Props {
  productTaxId: string;
  taxName: string;
  onRemoved: () => void;
}

export function RemoveTaxModal({ productTaxId, taxName, onRemoved }: Props) {
  const [open, setOpen] = useState(false);
  const [removeTax] = useMutation<RemoveTaxResponse>(
    REMOVE_TAX_FROM_PRODUCT_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    await execute(
      async () => {
        const res = await removeTax({ variables: { id: productTaxId } });
        if (!res.data?.removeTaxFromProduct?.status) {
          throw new Error(
            res.data?.removeTaxFromProduct?.message ??
              "Erro ao remover imposto"
          );
        }
        return res.data.removeTaxFromProduct;
      },
      {
        successMessage: "Imposto removido do produto",
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
          title="Remover imposto"
          description={`Remover o imposto "${taxName}" deste produto?`}
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
