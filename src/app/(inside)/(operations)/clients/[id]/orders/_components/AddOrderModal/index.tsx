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
  CLIENT_ASSIGNMENTS_QUERY,
  CREATE_ORDER_FROM_CLIENT_MUTATION,
} from "./gql";

interface AssignmentsData {
  sellerClientFactoryList: {
    edges: {
      node: {
        id: string;
        sellerId: string;
        factoryId: string;
        seller: { id: string; name: string } | null;
        factory: {
          id: string;
          nomeFantasia: string | null;
          razaoSocial: string;
        } | null;
      };
    }[];
  };
}

interface CreateOrderResponse {
  createOrder: { status: boolean; message: string; data: { id: string } | null };
}

const extractSelectValue = (val: unknown): string => {
  if (val && typeof val === "object" && "value" in val) {
    return String((val as { value: string }).value);
  }
  return String(val ?? "");
};

interface Props {
  clientId: string;
  onCreated?: () => void;
}

export function AddOrderModal({ clientId, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const invalidateClient = useInvalidateQueriesClient();
  const { execute, isLoading } = useAsyncAction();

  const { data: assignmentsData } = useQuery<AssignmentsData>(
    CLIENT_ASSIGNMENTS_QUERY,
    {
      variables: {
        input: {
          first: 200,
          filters: [{ field: "client_id", operator: "eq", value: clientId }],
        },
      },
      skip: !open,
    }
  );

  const assignments = useMemo(
    () =>
      assignmentsData?.sellerClientFactoryList?.edges
        ?.map((e) => e.node)
        .filter((n) => n.seller && n.factory) ?? [],
    [assignmentsData]
  );

  const assignmentOptions = useMemo(
    () =>
      assignments.map((a) => ({
        label: `${a.seller!.name} → ${
          a.factory!.nomeFantasia ?? a.factory!.razaoSocial
        }`,
        value: a.id,
      })),
    [assignments]
  );

  const formSteps: FormStepSchema[] = [
    {
      id: "order",
      sections: [
        {
          id: "details",
          fields: [
            {
              name: "assignment",
              type: "select-single",
              label: "Vendedor → Fábrica",
              placeholder:
                assignmentOptions.length === 0
                  ? "Cliente sem vínculos cadastrados"
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
  ];

  const [createOrder] = useMutation<CreateOrderResponse>(
    CREATE_ORDER_FROM_CLIENT_MUTATION
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const assignmentId = extractSelectValue(data.assignment);
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (!assignment) return;

    const input = {
      sellerId: assignment.sellerId,
      clientId,
      factoryId: assignment.factoryId,
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
        successMessage: "Pedido criado com sucesso",
        onSuccess: async () => {
          setOpen(false);
          formRef.current?.resetForm();
          await invalidateClient(["orders"]);
          onCreated?.();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="sm">
          <Button.Icon icon={Plus} />
          <Button.Title>Pedido</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Novo pedido"
          description="Selecione o vínculo vendedor-fábrica e a data do pedido."
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
