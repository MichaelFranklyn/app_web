"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { toIsoDate } from "@/utils/format/date";
import { useMutation } from "@apollo/client/react";
import { PackageCheck } from "lucide-react";
import { useRef, useState } from "react";

import { MARK_ORDERS_DELIVERED_MUTATION } from "./gql";
import { MarkOrdersDeliveredResponse } from "./interface";

interface Props {
  orderIds: string[];
  onDone: () => void;
}

// Data OPCIONAL: vazia, cada pedido fica com a própria previsão.
const STEPS: FormStepSchema[] = [
  {
    id: "delivery",
    sections: [
      {
        id: "fields",
        fields: [
          {
            name: "date",
            type: "date",
            label: "Chegou tudo no mesmo dia? (opcional)",
            hint: 'Deixe em branco para usar a data prevista de cada pedido, mostrada na coluna "Entregue em".',
          },
        ],
      },
    ],
  },
];

/**
 * Confirma a entrega dos pedidos marcados. Um pedido recusado não impede os
 * outros — o resultado diz quantos entraram e quais ficaram de fora.
 */
export function DeliverOrdersModal({ orderIds, onDone }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const [markDelivered] = useMutation<MarkOrdersDeliveredResponse>(
    MARK_ORDERS_DELIVERED_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();
  const count = orderIds.length;

  const handleSubmit = async (data: Record<string, unknown>) => {
    await execute(
      async () => {
        const res = await markDelivered({
          variables: {
            ids: orderIds,
            deliveredAt: toIsoDate(data.date) || null,
          },
        });
        const result = res.data?.markOrdersDelivered;
        if (!result) throw new Error("Não foi possível confirmar as entregas.");
        if (result.delivered === 0 && result.failures.length > 0) {
          throw new Error(result.failures[0].message);
        }
        return result;
      },
      {
        successMessage: (result) =>
          result.failures.length > 0
            ? `${result.delivered} entrega(s) confirmada(s). ${result.failures.length} pedido(s) não puderam ser entregues: ${result.failures[0].message}`
            : `${result.delivered} entrega(s) confirmada(s). Estoque dos clientes atualizado.`,
        onSuccess: () => {
          setOpen(false);
          formRef.current?.resetForm();
          onDone();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="md" noUppercase>
          <Button.Icon icon={PackageCheck} />
          <Button.Title>Confirmar entrega</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title={`Confirmar a entrega de ${count} pedido(s)`}
          description="Os pedidos saem da lista, o cliente volta para a rotina nesta fábrica e o estoque dele é atualizado."
        />
        <Modal.Body>
          <Title variant="body-sm" color="muted" className="mb-12 block">
            Só confirme o que você sabe que chegou. Pedido que ainda não chegou
            fica de fora da seleção.
          </Title>
          <FormBuilder
            ref={formRef}
            steps={STEPS}
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
