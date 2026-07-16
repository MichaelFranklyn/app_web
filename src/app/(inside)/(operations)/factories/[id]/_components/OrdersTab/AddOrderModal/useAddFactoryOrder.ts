import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useRef, useState } from "react";

import { FormBuilderRef, FormStepSchema } from "@/components/FormBuilder";
import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { extractSelectValue } from "@/utils/form";
import { toIsoDate } from "@/utils/format/date";

import {
  CREATE_ORDER_ITEM_MUTATION,
  CreateOrderItemResponse,
  createDraftItems,
  useOrderDraftItems,
} from "../../../../../_shared/orderDraftItems";
import { usePaymentTermOptions } from "../../../../../_shared/orderPaymentTerms";
import { FREIGHT_OPTIONS } from "../../../../../_shared/orderFreight";
import {
  CREATE_ORDER_FROM_FACTORY_MUTATION,
  FACTORY_ASSIGNMENTS_QUERY,
} from "../gql";
import { CreateOrderResponse, FactoryAssignmentsData } from "../interface";

export interface AddFactoryOrderProps {
  factoryId: string;
}

interface OrderDetails {
  sellerId: string;
  clientId: string;
  orderDate: string;
  paymentTermId: string | null;
  freightType: string | null;
  notes: string | null;
}

const clientLabel = (c: {
  razaoSocial: string;
  nomeFantasia: string | null;
}): string => c.nomeFantasia ?? c.razaoSocial;

/**
 * Novo pedido a partir da fábrica — MESMO wizard de 2 passos da lista /orders
 * (dados + itens opcionais), com a fábrica fixa: o passo 1 escolhe o vínculo
 * vendedor→cliente e o passo 2 usa o rascunho de itens compartilhado.
 */
export function useAddFactoryOrder({ factoryId }: AddFactoryOrderProps) {
  const [open, setOpen] = useState(false);
  // 0 = dados do pedido, 1 = itens (opcional).
  const [step, setStep] = useState(0);
  const formRef = useRef<FormBuilderRef>(null);
  const invalidateClient = useInvalidateQueriesClient();
  const { toast } = useToast();
  const { execute, isLoading } = useAsyncAction();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  const draft = useOrderDraftItems(open, factoryId);
  const paymentTermOptions = usePaymentTermOptions(open, factoryId || null);

  const { data: assignmentsData, error: assignmentsError } =
    useQuery<FactoryAssignmentsData>(FACTORY_ASSIGNMENTS_QUERY, {
      variables: {
        input: {
          first: 200,
          filters: [{ field: "factory_id", operator: "eq", value: factoryId }],
        },
      },
      skip: !open,
    });

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
                name: "paymentTermId",
                type: "select-single",
                label: "Condição de pagamento (opcional)",
                placeholder:
                  paymentTermOptions.length === 0
                    ? "Fábrica sem condições cadastradas"
                    : "Selecione a condição (ex.: 30/60/90)",
                disabled: paymentTermOptions.length === 0,
                options: paymentTermOptions,
              },
              {
                name: "freightType",
                type: "select-single",
                label: "Frete (opcional)",
                placeholder: "FOB ou CIF",
                options: FREIGHT_OPTIONS,
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
    [assignmentOptions, paymentTermOptions]
  );

  const [createOrder] = useMutation<CreateOrderResponse>(
    CREATE_ORDER_FROM_FACTORY_MUTATION
  );
  const [createOrderItem] = useMutation<CreateOrderItemResponse>(
    CREATE_ORDER_ITEM_MUTATION
  );

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) {
      formRef.current?.resetForm();
      setStep(0);
      setOrderDetails(null);
      draft.reset();
    }
  };

  // Passo 1 válido: guarda os dados e avança para os itens.
  const handleDetailsValid = (data: Record<string, unknown>) => {
    const assignmentId = extractSelectValue(data.assignment);
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (!assignment) return;
    setOrderDetails({
      sellerId: assignment.sellerId,
      clientId: assignment.clientId,
      orderDate: toIsoDate(data.orderDate),
      paymentTermId: extractSelectValue(data.paymentTermId) || null,
      freightType: extractSelectValue(data.freightType) || null,
      notes: data.notes ? String(data.notes) : null,
    });
    setStep(1);
  };

  const goToDetails = () => setStep(0);

  // Passo 2: cria o pedido e, em seguida, cada item do rascunho.
  const handleCreate = async () => {
    if (!orderDetails) return;

    await execute(
      async () => {
        const res = await createOrder({
          variables: { input: { ...orderDetails, factoryId } },
        });
        if (!res.data?.createOrder?.status || !res.data.createOrder.data) {
          throw new Error(
            res.data?.createOrder?.message ?? "Erro ao criar pedido"
          );
        }
        const order = res.data.createOrder.data;
        const failed = await createDraftItems(
          createOrderItem,
          order.id,
          draft.items
        );
        return { failed };
      },
      {
        successMessage: "Pedido criado com sucesso",
        onSuccess: async ({ failed }) => {
          if (failed.length) {
            toast({
              variant: "error",
              title: "Alguns itens não foram adicionados",
              description: `${failed.join(", ")} — adicione no detalhe do pedido.`,
            });
          }
          handleClose(false);
          await invalidateClient(["factory_orders", "orders"]);
        },
      }
    );
  };

  useQueryErrorToast(
    assignmentsError,
    "Não foi possível carregar as opções. Tente novamente."
  );

  return {
    open,
    handleClose,
    step,
    formRef,
    formSteps,
    handleDetailsValid,
    goToDetails,
    handleCreate,
    draft,
    isLoading,
  };
}
