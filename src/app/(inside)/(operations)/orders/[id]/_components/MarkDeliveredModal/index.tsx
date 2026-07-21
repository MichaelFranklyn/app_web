"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { getTodayIso, toIsoDate } from "@/utils/format/date";
import { useMutation } from "@apollo/client/react";
import { PackageCheck } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { MARK_ORDER_DELIVERED_MUTATION } from "../../gql";
import { OrderDetail } from "../../interface";

interface MarkDeliveredResponse {
  markOrderDelivered: {
    status: boolean;
    message: string;
    data: { id: string } | null;
  };
}

interface Props {
  order: OrderDetail;
  onSuccess: () => void;
}

export function MarkDeliveredModal({ order, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const [markDelivered] = useMutation<MarkDeliveredResponse>(
    MARK_ORDER_DELIVERED_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "deliver",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "deliveredAt",
                type: "date",
                label: "Data da entrega",
                required: true,
                hint: "Dia em que a mercadoria chegou na loja do cliente. É a partir dela que o estoque do cliente é reabastecido.",
              },
            ],
          },
        ],
      },
    ],
    []
  );

  const initialData = useMemo(() => ({ deliveredAt: getTodayIso() }), []);

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) formRef.current?.resetForm();
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    await execute(
      async () => {
        const deliveredAt = toIsoDate(data.deliveredAt);
        if (!deliveredAt) throw new Error("Informe a data da entrega.");
        const res = await markDelivered({
          variables: { id: order.id, deliveredAt },
        });
        if (!res.data?.markOrderDelivered?.status) {
          throw new Error(
            res.data?.markOrderDelivered?.message ??
              "Erro ao confirmar a entrega"
          );
        }
        return res.data.markOrderDelivered;
      },
      {
        // A mensagem vem do backend: nem toda entrega abastece o estoque (pedido
        // fora da carteira, pedido sem itens), e o toast não pode prometer o que
        // não aconteceu.
        successMessage: (result) => result?.message ?? "Entrega confirmada.",
        onSuccess: () => {
          handleClose(false);
          onSuccess();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="sm">
          <Button.Icon icon={PackageCheck} />
          <Button.Title>Confirmar entrega</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Confirmar entrega"
          description="Registra a chegada da mercadoria na loja. Só aqui o estoque do cliente é reabastecido — faturar não significa que o pedido já chegou."
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={steps}
            initialData={initialData}
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
            <Button.Title>Confirmar entrega</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
