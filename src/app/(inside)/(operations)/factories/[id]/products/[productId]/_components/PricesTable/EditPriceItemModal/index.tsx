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
import { UPDATE_PRICE_LIST_ITEM_MUTATION } from "../gql";

interface PriceItemNode {
  __typename?: "PriceListItemType";
  id: string;
  unitPrice: string;
  unitPriceWithImpost: string;
}

interface UpdateItemResponse {
  updatePriceListItem: {
    __typename?: "PriceListItemTypeDataResponse";
    status: boolean;
    message: string;
    data: PriceItemNode | null;
  };
}

interface Props {
  item: PriceItemNode;
  label: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}

export function EditPriceItemModal({
  item,
  label,
  open,
  onOpenChange,
  onChanged,
}: Props) {
  const formRef = useRef<FormBuilderRef>(null);
  const [updateItem] = useMutation<UpdateItemResponse>(
    UPDATE_PRICE_LIST_ITEM_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

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
                label: "Valor unitário",
                required: true,
                placeholder: "0,00",
              },
            ],
          },
        ],
      },
    ],
    []
  );

  const initialData = useMemo(
    () => ({
      unitPrice: maskCurrency(String(Math.round(Number(item.unitPrice) * 100))),
    }),
    [item.unitPrice]
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const unitPrice = parseMoneyToNumber(String(data.unitPrice ?? ""));
    if (unitPrice <= 0) return;

    await execute(
      async () => {
        const res = await updateItem({
          variables: { id: item.id, input: { unitPrice } },
        });

        if (
          !res.data?.updatePriceListItem?.status ||
          !res.data.updatePriceListItem.data
        ) {
          throw new Error(
            res.data?.updatePriceListItem?.message ?? "Erro ao atualizar preço"
          );
        }
        return res.data.updatePriceListItem.data;
      },
      {
        successMessage: "Preço atualizado com sucesso",
        onSuccess: () => {
          onOpenChange(false);
          onChanged();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header
          title="Editar preço"
          description={`Altere o valor unitário de "${label}".`}
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
