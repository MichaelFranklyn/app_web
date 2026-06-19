"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { formatMoney } from "@/utils/format/masks";
import { useMutation } from "@apollo/client/react";
import { Pencil } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { OrderItem } from "../../../interface";
import { UPDATE_ORDER_ITEM_MUTATION } from "../gql";

interface UpdateOrderItemResponse {
  updateOrderItem: {
    status: boolean;
    message: string;
    data: OrderItem | null;
  };
}

interface Props {
  item: OrderItem;
  onOptimisticUpdate: (id: string, updates: Partial<OrderItem>) => void;
  onRollback: () => void;
  onRefetch: () => void;
}

export function EditOrderItemModal({
  item,
  onOptimisticUpdate,
  onRollback,
  onRefetch,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);

  const [updateOrderItem] = useMutation<UpdateOrderItemResponse>(
    UPDATE_ORDER_ITEM_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const saleMultiple = Number(item.product?.saleMultiple) || 0;

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "item",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "priceLabel",
                type: "text",
                label: "Preço por embalagem (tabela)",
                disabled: true,
                hint: "O preço vem da tabela de preço da fábrica e não é editável aqui.",
                grid: { mobile: 12, tablet: 6, desktop: 6 },
              },
              {
                name: "quantity",
                type: "number",
                label: "Quantidade",
                required: true,
                placeholder: "0",
                hint: saleMultiple
                  ? `Em embalagens. Vendido em múltiplos de ${saleMultiple}.`
                  : "Em embalagens, não em unidades.",
                grid: { mobile: 12, tablet: 6, desktop: 6 },
              },
              {
                name: "discount",
                type: "number",
                label: "Desconto (R$)",
                placeholder: "0",
                grid: { mobile: 12, tablet: 6, desktop: 6 },
              },
            ],
          },
        ],
      },
    ],
    [saleMultiple]
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const quantity = Number(data.quantity);
    const discount = Number(data.discount ?? 0) || 0;
    const unitPrice = Number(item.unitPrice);

    if (!quantity || quantity <= 0) {
      throw new Error("Informe uma quantidade válida.");
    }
    if (saleMultiple && quantity % saleMultiple !== 0) {
      throw new Error(
        `Este produto é vendido em múltiplos de ${saleMultiple} embalagem(ns).`
      );
    }

    const subtotal = Math.max(0, quantity * unitPrice - discount);

    onOptimisticUpdate(item.id, {
      quantity: String(quantity),
      discount: String(discount),
      subtotal: subtotal.toFixed(2),
    });
    setOpen(false);

    await execute(
      async () => {
        const res = await updateOrderItem({
          variables: {
            id: item.id,
            input: { quantity, discount },
          },
        });
        if (!res.data?.updateOrderItem?.status) {
          throw new Error(
            res.data?.updateOrderItem?.message ?? "Erro ao atualizar item"
          );
        }
        return res.data.updateOrderItem;
      },
      {
        successMessage: "Item atualizado",
        onSuccess: () => onRefetch(),
        onError: () => onRollback(),
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root
          appearance="ghost"
          color="neutral"
          size="xs"
          isIconOnly
          noUppercase
          aria-label="Editar item"
        >
          <Button.Icon icon={Pencil} />
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Editar item"
          description={item.product?.name ?? "Item do pedido"}
        />

        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={steps}
            initialData={{
              priceLabel: formatMoney(item.unitPrice),
              quantity: Number(item.quantity),
              discount: Number(item.discount),
            }}
            onSubmit={handleSubmit}
            loading={isLoading}
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
