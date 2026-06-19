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
import { useMutation, useQuery } from "@apollo/client/react";
import { Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toIsoDate } from "@/utils/format/date";
import {
  CREATE_ORDER_FROM_FACTORY_MUTATION,
  FACTORY_ASSIGNMENTS_QUERY,
} from "./gql";
import {
  CreateOrderResponse,
  FactoryAssignmentsData,
} from "./interface";

interface Props {
  factoryId: string;
}

const clientLabel = (c: {
  razaoSocial: string;
  nomeFantasia: string | null;
}): string => c.nomeFantasia ?? c.razaoSocial;

export function AddOrderModal({ factoryId }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const invalidateClient = useInvalidateQueriesClient();
  const { execute, isLoading } = useAsyncAction();

  const { data: assignmentsData } = useQuery<FactoryAssignmentsData>(
    FACTORY_ASSIGNMENTS_QUERY,
    {
      variables: {
        input: {
          first: 200,
          filters: [
            { field: "factory_id", operator: "eq", value: factoryId },
          ],
        },
      },
      skip: !open,
    }
  );

  const assignments = useMemo(
    () =>
      assignmentsData?.sellerClientFactoryList?.edges
        ?.map((e) => e.node)
        .filter((n) => n.seller && n.client) ?? [],
    [assignmentsData]
  );

  const assignmentOptions = useMemo(
    () =>
      assignments.map((a) => ({
        label: `${a.seller!.name} → ${clientLabel(a.client!)}`,
        value: a.id,
      })),
    [assignments]
  );

  const formSteps = useMemo<FormStepSchema[]>(
    () => [
      {
        id: "order",
        sections: [
          {
            id: "details",
            fields: [
              {
                name: "assignment",
                type: "select-single",
                label: "Vendedor → Cliente",
                placeholder:
                  assignmentOptions.length === 0
                    ? "Sem vínculos disponíveis para esta fábrica"
                    : "Selecione o vínculo",
                required: true,
                options: assignmentOptions,
              },
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
    ],
    [assignmentOptions]
  );

  const [createOrder] = useMutation<CreateOrderResponse>(
    CREATE_ORDER_FROM_FACTORY_MUTATION
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const assignmentId = (data.assignment as { value: string } | null)?.value;
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (!assignment) return;

    const input = {
      sellerId: assignment.sellerId,
      clientId: assignment.clientId,
      factoryId,
      orderDate: toIsoDate(data.orderDate),
      notes: data.notes ? String(data.notes) : null,
    };

    await execute(
      async () => {
        const res = await createOrder({ variables: { input } });
        if (!res.data?.createOrder?.status || !res.data.createOrder.data) {
          throw new Error(
            res.data?.createOrder?.message ?? "Erro ao criar pedido"
          );
        }
        return res.data.createOrder.data;
      },
      {
        successMessage: "Pedido iniciado com sucesso",
        onSuccess: async () => {
          setOpen(false);
          formRef.current?.resetForm();
          await invalidateClient(["factory_orders", "orders"]);
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="sm">
          <Button.Icon icon={Plus} />
          <Button.Title>Novo pedido</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Novo pedido"
          description="Selecione o vínculo vendedor-cliente desta fábrica."
        />

        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={formSteps}
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
            <Button.Title>Criar pedido</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
