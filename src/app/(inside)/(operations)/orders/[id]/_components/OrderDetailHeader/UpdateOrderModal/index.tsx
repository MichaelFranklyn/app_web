"use client";

import { Button } from "@/components/Button";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { Pencil } from "lucide-react";
import { useRef, useState } from "react";
import { UPDATE_ORDER_MUTATION } from "./gql";
import { UpdateOrderModalProps, UpdateOrderResponse } from "./interface";
import { UPDATE_ORDER_FORM_STEPS, normalizeUpdateInput } from "./utils";

export function UpdateOrderModal({
  orderId,
  currentNotes,
  currentFreightType,
  currentStatus,
  currentFileUrl,
  currentFileParsed,
  onSuccess,
}: UpdateOrderModalProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);

  const [updateOrder] = useMutation<UpdateOrderResponse>(UPDATE_ORDER_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const normalized = normalizeUpdateInput(data, currentNotes, currentFreightType);

    if (Object.keys(normalized).length === 0) {
      setOpen(false);
      return;
    }

    const nextNotes = ("notes" in normalized ? normalized.notes : currentNotes) as string | null;
    const nextFreight = (
      "freightType" in normalized ? normalized.freightType : currentFreightType
    ) as string | null;

    await execute(
      async () => {
        const res = await updateOrder({
          variables: { id: orderId, input: normalized },
          // Otimismo: o cache do pedido reflete a alteração na hora.
          optimisticResponse: {
            updateOrder: {
              __typename: "OrderTypeDataResponse",
              status: true,
              code: 200,
              message: "",
              data: {
                __typename: "OrderType",
                id: orderId,
                status: currentStatus,
                freightType: nextFreight,
                notes: nextNotes,
                fileUrl: currentFileUrl,
                fileParsed: currentFileParsed,
              },
            },
          },
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
          onSuccess();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="outline" color="neutral" size="sm">
          <Button.Icon icon={Pencil} />
          <Button.Title>Editar</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Editar pedido"
          description="Atualize o frete e as observações do pedido."
        />

        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={UPDATE_ORDER_FORM_STEPS}
            initialData={{
              notes: currentNotes ?? "",
              freightType:
                currentFreightType === "FOB"
                  ? { value: "FOB", label: "FOB — frete por conta do cliente" }
                  : currentFreightType === "CIF"
                    ? { value: "CIF", label: "CIF — entrega pela fábrica" }
                    : null,
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
