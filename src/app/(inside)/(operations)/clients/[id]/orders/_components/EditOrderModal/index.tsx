"use client";

import { Button } from "@/components/Button";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { Pencil } from "lucide-react";
import { useRef, useState } from "react";
import { UPDATE_ORDER_FROM_CLIENT_MUTATION } from "./gql";
import { EditOrderModalProps, UpdateOrderResponse } from "./interface";
import { EDIT_ORDER_FORM_STEPS, normalizeUpdateInput } from "./utils";

export function EditOrderModal({ orderId, initialNotes }: EditOrderModalProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);

  const [updateOrder] = useMutation<UpdateOrderResponse>(
    UPDATE_ORDER_FROM_CLIENT_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const input = normalizeUpdateInput(data, { notes: initialNotes });

    if (Object.keys(input).length === 0) {
      setOpen(false);
      return;
    }

    const nextNotes = input.notes ?? null;

    await execute(
      async () => {
        const res = await updateOrder({
          variables: { id: orderId, input },
          optimisticResponse: {
            updateOrder: {
              __typename: "OrderTypeDataResponse",
              status: true,
              code: 200,
              message: "",
              data: {
                __typename: "OrderType",
                id: orderId,
                notes: nextNotes,
              },
            },
          } as UpdateOrderResponse,
        });

        if (!res.data?.updateOrder?.status || !res.data.updateOrder.data) {
          throw new Error(
            res.data?.updateOrder?.message ?? "Erro ao atualizar pedido"
          );
        }

        return res.data.updateOrder.data;
      },
      {
        successMessage: "Pedido atualizado com sucesso",
        onSuccess: () => {
          setOpen(false);
          formRef.current?.resetForm();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="ghost" color="neutral" size="xs" noUppercase>
          <Button.Icon icon={Pencil} />
          <Button.Title>Editar</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Editar pedido"
          description="Atualize as observações do pedido."
        />

        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={EDIT_ORDER_FORM_STEPS}
            onSubmit={handleSubmit}
            loading={isLoading}
            initialData={{ notes: initialNotes ?? "" }}
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
