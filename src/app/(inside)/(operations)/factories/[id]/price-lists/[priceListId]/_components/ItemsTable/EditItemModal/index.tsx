"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { maskCurrency, parseMoneyToNumber } from "@/utils/format/masks";
import { useMutation } from "@apollo/client/react";
import { useMemo, useRef } from "react";
import { PriceListItemRow } from "../interface";
import { UPDATE_PRICE_LIST_ITEM_MUTATION } from "./gql";

interface UpdateResponse {
  updatePriceListItem: { status: boolean; message: string };
}

interface Props {
  item: PriceListItemRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export function EditItemModal({ item, open, onOpenChange, onUpdated }: Props) {
  const formRef = useRef<FormBuilderRef>(null);
  const [updateItem] = useMutation<UpdateResponse>(
    UPDATE_PRICE_LIST_ITEM_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const packLabel = item.product?.unitLabel?.label ?? "embalagem";

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "item",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "unitPrice",
                type: "currency",
                label: `Preço por ${packLabel}`,
                required: true,
                placeholder: "0,00",
                hint: "Preço da embalagem fechada.",
              },
            ],
          },
        ],
      },
    ],
    [packLabel]
  );

  const initialData = useMemo(
    () => ({
      unitPrice: maskCurrency(String(Math.round(Number(item.unitPrice) * 100))),
    }),
    [item]
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const input: Record<string, unknown> = {};
    const unitPrice = parseMoneyToNumber(String(data.unitPrice ?? ""));
    if (unitPrice > 0 && unitPrice !== Number(item.unitPrice))
      input.unitPrice = unitPrice;

    if (Object.keys(input).length === 0) {
      onOpenChange(false);
      return;
    }

    await execute(
      async () => {
        const res = await updateItem({ variables: { id: item.id, input } });
        if (!res.data?.updatePriceListItem?.status) {
          throw new Error(
            res.data?.updatePriceListItem?.message ?? "Erro ao atualizar item"
          );
        }
        return res.data.updatePriceListItem;
      },
      {
        successMessage: "Item atualizado",
        onSuccess: async () => {
          onOpenChange(false);
          onUpdated();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title="Editar item"
          description={`Altere o preço por ${packLabel} de "${item.product?.name ?? "produto removido"}".`}
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={steps}
            onSubmit={handleSubmit}
            loading={isLoading}
            initialData={initialData}
            unstyled
          />
        </Modal.Body>
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
            color="amber"
            size="md"
            noUppercase
            loading={isLoading}
            onClick={() => formRef.current?.submitForm()}
          >
            <Button.Title>Salvar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
