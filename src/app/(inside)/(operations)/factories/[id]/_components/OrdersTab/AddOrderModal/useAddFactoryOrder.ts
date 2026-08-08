import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useRef, useState } from "react";

import { FormBuilderRef, FormStepSchema } from "@/components/FormBuilder";
import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import {
  extractSelectValue,
  parseDeliveryDays,
  parseCoverageDays,
} from "@/utils/form";
import { toIsoDate } from "@/utils/format/date";

import {
  CREATE_ORDER_ITEM_MUTATION,
  CreateOrderItemResponse,
  createDraftItems,
  useOrderDraftItems,
} from "../../../../../_shared/orderDraftItems";
import {
  coverageHint,
  useCoverageSuggestion,
} from "../../../../../_shared/orderCoverage";
import { usePaymentTermOptions } from "../../../../../_shared/orderPaymentTerms";
import {
  FREIGHT_OPTIONS,
  useFreeFreightTarget,
} from "../../../../../_shared/orderFreight";
import {
  clientOptionLabel,
  clientOptionSearchText,
} from "../../../../../_shared/clientOption";
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
  deliveryEstimateDays: number | null;
  coverageDays: number | null;
  isQuote: boolean;
}

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
  // Cliente do vínculo escolhido no passo 1 — o passo 2 usa o nível acordado
  // com ele para sugerir o preço dos itens.
  const [clientId, setClientId] = useState("");
  // O vínculo inteiro, e não só o cliente: a sugestão de cobertura sai da
  // cadência dele.
  const [assignmentId, setAssignmentId] = useState("");

  const draft = useOrderDraftItems(open, factoryId, clientId);
  const { options: paymentTermOptions, minimumOf } = usePaymentTermOptions(
    open,
    factoryId || null
  );
  // Só existe a partir do passo 2: a condição é escolhida no passo 1 e chega
  // aqui já validada, dentro de `orderDetails`.
  const paymentMinimum = minimumOf(orderDetails?.paymentTermId);
  // Piso de frete grátis da modalidade escolhida no passo 1 — incentivo,
  // nunca bloqueio. Reaproveita a consulta do vínculo da fábrica.
  const freeFreight = useFreeFreightTarget(
    open,
    factoryId || null,
    orderDetails?.freightType
  );

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

  const selectedAssignment = useMemo(
    () => assignments.find((a) => a.id === assignmentId) ?? null,
    [assignments, assignmentId]
  );

  useCoverageSuggestion(formRef, selectedAssignment?.cadence, open);

  const assignmentOptions = useMemo(
    () =>
      assignments.map((a) => ({
        label: `${a.seller!.name} → ${clientOptionLabel(a.client!)}`,
        value: a.id,
        searchText: clientOptionSearchText(a.client!),
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
                name: "orderKind",
                type: "radio",
                label: "Tipo",
                hint: "O orçamento pode ser convertido em pedido depois. Só o pedido pode ser faturado.",
                required: true,
                options: [
                  { label: "Pedido", value: "order" },
                  { label: "Orçamento", value: "quote" },
                ],
              },
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
                onChange: (value) => {
                  const id = extractSelectValue(value);
                  const assignment = assignments.find((a) => a.id === id);
                  setAssignmentId(id);
                  setClientId(assignment?.clientId ?? "");
                },
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
                name: "deliveryEstimateDays",
                type: "number",
                label: "Prazo de entrega (dias)",
                placeholder: "Ex: 15",
                hint: "Dias até a mercadoria chegar, contados do faturamento. Em branco: usa o prazo padrão da fábrica.",
              },
              {
                name: "coverageDays",
                type: "number",
                label: "Dura quantos dias na loja?",
                placeholder: "Ex: 30",
                hint: coverageHint(selectedAssignment?.cadence),
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
    [
      assignments,
      assignmentOptions,
      paymentTermOptions,
      // A dica do campo de cobertura diz de onde veio o número sugerido, e isso
      // muda com o vínculo escolhido.
      selectedAssignment,
    ]
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
      setClientId("");
      setAssignmentId("");
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
      deliveryEstimateDays: parseDeliveryDays(data.deliveryEstimateDays),
      // Estimativa de campo do vendedor; o backend descarta fora da faixa plausivel.
      coverageDays: parseCoverageDays(data.coverageDays),
      isQuote: extractSelectValue(data.orderKind) === "quote",
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
    paymentMinimum,
    freeFreight,
    isLoading,
  };
}
