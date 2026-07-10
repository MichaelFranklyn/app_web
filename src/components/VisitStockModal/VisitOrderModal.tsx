"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { toIsoDate } from "@/utils/format/date";

import { factoryLabel } from "./FactoryCard";
import { CREATE_VISIT_ORDER_MUTATION } from "./gql";
import { StockCandidateGroup } from "./useStockObservation";

interface CreateOrderResponse {
  createOrder: {
    status: boolean;
    message: string;
    data: { id: string } | null;
  };
}

interface Props {
  /** Fábrica escolhida no modal de estoque. */
  group: StockCandidateGroup | null;
  /** Visita de origem — amarra o pedido à ida que o gerou. */
  itemId: string;
  /** Controlado pelo pai: o estoque some antes de isto aparecer. */
  open: boolean;
  /** Cancelar: devolve o vendedor ao estoque. */
  onClose: () => void;
  /** Criado: fecha o fluxo inteiro, senão o estoque pisca antes de navegarmos. */
  onCreated: () => void;
}

const FORM_STEPS: FormStepSchema[] = [
  {
    id: "order",
    sections: [
      {
        id: "details",
        fields: [
          {
            name: "orderDate",
            type: "date",
            label: "Data do pedido",
            required: true,
          },
          {
            name: "notes",
            type: "textarea",
            label: "Observações",
            placeholder: "Observações adicionais...",
            rows: 3,
          },
        ],
      },
    ],
  },
];

/**
 * Pedido lançado de dentro da visita, para UMA fábrica do cliente.
 *
 * O vendedor acabou de perguntar o estoque e descobriu que um produto vai acabar:
 * o pedido sai daí, sem ele ter de sair da visita e reencontrar o vínculo numa
 * lista. Vendedor, cliente e fábrica já vêm do grupo — só a data é decisão dele.
 *
 * O pedido nasce vazio; ao criar, levamos o vendedor à página do pedido, onde ele
 * adiciona os itens.
 */
export function VisitOrderModal({
  group,
  itemId,
  open,
  onClose,
  onCreated,
}: Props) {
  const router = useRouter();
  const formRef = useRef<FormBuilderRef>(null);
  const invalidateClient = useInvalidateQueriesClient();
  const { execute, isLoading } = useAsyncAction();

  const [createOrder] = useMutation<CreateOrderResponse>(
    CREATE_VISIT_ORDER_MUTATION
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    // Sem fábrica não há pedido; o botão que abre este modal já fica desabilitado.
    if (!group?.factory) return;

    const input = {
      sellerId: group.sellerId,
      clientId: group.clientId,
      factoryId: group.factory.id,
      orderDate: toIsoDate(data.orderDate),
      notes: data.notes ? String(data.notes) : null,
      visitScheduleItemId: itemId,
    };

    await execute(
      async () => {
        const res = await createOrder({ variables: { input } });
        const payload = res.data?.createOrder;
        if (!payload?.status || !payload.data) {
          throw new Error(payload?.message ?? "Erro ao criar pedido");
        }
        return payload.data;
      },
      {
        successMessage: "Pedido criado — adicione os itens",
        onSuccess: async (order) => {
          formRef.current?.resetForm();
          onCreated();
          await invalidateClient(["orders", "companyClient"]);
          router.push(`/orders/${order.id}`);
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Modal.Content size="md">
        <Modal.Header
          title="Novo pedido"
          description={
            group
              ? `Pedido de ${factoryLabel(group)} para este cliente, registrado nesta visita.`
              : ""
          }
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={FORM_STEPS}
            onSubmit={handleSubmit}
            loading={isLoading}
            // O pedido nasce durante a visita: a data de hoje é a resposta certa
            // quase sempre, e o vendedor só mexe nela na exceção.
            initialData={{ orderDate: new Date() }}
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
            <Button.Title>Criar pedido</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
