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
import { Pencil } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { isQuantityMultiple } from "../../../../../_shared/orderItemCatalog";
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
  ipiInOrder?: boolean;
  onOptimisticUpdate: (id: string, updates: Partial<OrderItem>) => void;
  onRollback: () => void;
  onRefetch: () => void;
}

export function EditOrderItemModal({
  item,
  ipiInOrder = false,
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

  // Múltiplo de venda em UNIDADES: o produto cadastra em embalagens, a
  // quantidade do item é em peças (saleMultiple × unitPerPack).
  const saleMultiple =
    (Number(item.product?.saleMultiple) || 0) *
    (Number(item.product?.unitPerPack) || 1);

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
                label: "Preço por unidade",
                required: true,
                placeholder: "0,00",
                hint: "Preço de uma unidade. Ajuste se este pedido tiver um valor negociado.",
              },
              {
                name: "quantity",
                type: "number",
                label: "Quantidade",
                required: true,
                placeholder: "0",
                hint: saleMultiple
                  ? `Em unidades. Vendido em múltiplos de ${saleMultiple}.`
                  : "Em unidades (peças), não em embalagens.",
              },
              {
                name: "discount",
                type: "number",
                label: "Desconto (R$)",
                placeholder: "0",
              },
              ...(ipiInOrder
                ? [
                    {
                      name: "ipiRate",
                      type: "number" as const,
                      label: "Alíq. IPI (%)",
                      placeholder: "0",
                      hint: "IPI cobrado neste pedido, somado por cima do subtotal.",
                    },
                  ]
                : []),
            ],
          },
        ],
      },
    ],
    [saleMultiple, ipiInOrder]
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const quantity = Number(data.quantity);
    const discount = Number(data.discount ?? 0) || 0;
    const ipiRate = ipiInOrder
      ? Number(data.ipiRate ?? 0) || 0
      : Number(item.ipiRate);
    const unitPrice = parseMoneyToNumber(String(data.unitPrice ?? ""));

    if (!unitPrice || unitPrice <= 0) {
      throw new Error("Informe um preço válido para o item.");
    }
    if (!quantity || quantity <= 0) {
      throw new Error("Informe uma quantidade válida.");
    }
    if (saleMultiple && !isQuantityMultiple(quantity, saleMultiple)) {
      throw new Error(
        `Este produto é vendido em múltiplos de ${saleMultiple} unidade(s).`
      );
    }

    const subtotal = Math.max(0, quantity * unitPrice - discount);
    const ipiAmount = subtotal * (ipiRate / 100);

    onOptimisticUpdate(item.id, {
      quantity: String(quantity),
      discount: String(discount),
      unitPrice: unitPrice.toFixed(2),
      subtotal: subtotal.toFixed(2),
      ipiRate: String(ipiRate),
      ipiAmount: ipiAmount.toFixed(2),
    });
    setOpen(false);

    await execute(
      async () => {
        const res = await updateOrderItem({
          variables: {
            id: item.id,
            input: { quantity, discount, unitPrice, ipiRate },
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
          size="sm"
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
              unitPrice: maskCurrency(Number(item.unitPrice).toFixed(2)),
              quantity: Number(item.quantity),
              discount: Number(item.discount),
              ...(ipiInOrder ? { ipiRate: Number(item.ipiRate) } : {}),
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
