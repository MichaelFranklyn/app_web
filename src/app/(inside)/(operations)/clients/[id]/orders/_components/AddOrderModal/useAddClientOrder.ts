import { FormBuilderRef, FormStepSchema } from "@/components/FormBuilder";
import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useRedirectTransition } from "@/hooks/useRedirectTransition";
import { extractSelectValue } from "@/utils/form";
import { toIsoDate } from "@/utils/format/date";
import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useRef, useState } from "react";

import {
  CREATE_ORDER_ITEM_MUTATION,
  CreateOrderItemResponse,
  createDraftItems,
  useOrderDraftItems,
} from "../../../../../_shared/orderDraftItems";
import { usePaymentTermOptions } from "../../../../../_shared/orderPaymentTerms";
import { FREIGHT_OPTIONS } from "../../../../../_shared/orderFreight";
import {
  CLIENT_ASSIGNMENTS_QUERY,
  CREATE_ORDER_FROM_CLIENT_MUTATION,
} from "./gql";

interface AssignmentNode {
  id: string;
  sellerId: string;
  factoryId: string;
  seller: { id: string; name: string } | null;
  factory: {
    id: string;
    nomeFantasia: string | null;
    razaoSocial: string;
  } | null;
}

interface AssignmentsData {
  sellerClientFactoryList: { edges: { node: AssignmentNode }[] };
}

interface CreateOrderResponse {
  createOrder: {
    status: boolean;
    message: string;
    data: { id: string } | null;
  };
}

interface OrderDetails {
  sellerId: string;
  clientId: string;
  factoryId: string;
  orderDate: string;
  paymentTermId: string | null;
  freightType: string | null;
  notes: string | null;
  isQuote: boolean;
}

export function useAddClientOrder(clientId: string) {
  const [open, setOpen] = useState(false);
  // 0 = dados do pedido, 1 = itens (opcional).
  const [step, setStep] = useState(0);
  const formRef = useRef<FormBuilderRef>(null);
  const { redirect, isRedirecting } = useRedirectTransition();
  const { toast } = useToast();

  // Fábrica do vínculo escolhido no passo 1 — alimenta o catálogo do passo 2.
  const [factoryId, setFactoryId] = useState("");
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  const draft = useOrderDraftItems(open, factoryId, clientId);
  const paymentTermOptions = usePaymentTermOptions(open, factoryId || null);

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

  const formSteps: FormStepSchema[] = useMemo(
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
                label: "Vendedor → Fábrica",
                placeholder:
                  assignmentOptions.length === 0
                    ? "Cliente sem vínculos cadastrados"
                    : "Selecione o vínculo",
                required: true,
                options: assignmentOptions,
                // Ao escolher o vínculo já sabemos a fábrica: o passo de itens
                // pode carregar o catálogo dela enquanto o usuário preenche o resto.
                onChange: (value, setValue) => {
                  const id = extractSelectValue(value);
                  const assignment = assignments.find((a) => a.id === id);
                  setFactoryId(assignment?.factoryId ?? "");
                  // Condições de pagamento são da fábrica: trocar o vínculo
                  // invalida a escolhida.
                  setValue("paymentTermId", "");
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
                placeholder: !factoryId
                  ? "Selecione o vínculo primeiro"
                  : paymentTermOptions.length === 0
                    ? "Fábrica sem condições cadastradas"
                    : "Selecione a condição (ex.: 30/60/90)",
                disabled: !factoryId || paymentTermOptions.length === 0,
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
    [assignmentOptions, assignments, factoryId, paymentTermOptions]
  );

  const [createOrder] = useMutation<CreateOrderResponse>(
    CREATE_ORDER_FROM_CLIENT_MUTATION
  );
  const [createOrderItem] = useMutation<CreateOrderItemResponse>(
    CREATE_ORDER_ITEM_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) {
      formRef.current?.resetForm();
      setStep(0);
      setFactoryId("");
      setOrderDetails(null);
      draft.reset();
    }
  };

  // Passo 1 válido: guarda os dados do pedido e avança para os itens.
  const handleDetailsValid = (data: Record<string, unknown>) => {
    const assignmentId = extractSelectValue(data.assignment);
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (!assignment) return;

    setOrderDetails({
      sellerId: assignment.sellerId,
      clientId,
      factoryId: assignment.factoryId,
      orderDate: toIsoDate(data.orderDate),
      paymentTermId: extractSelectValue(data.paymentTermId) || null,
      freightType: extractSelectValue(data.freightType) || null,
      notes: data.notes ? String(data.notes) : null,
      isQuote: extractSelectValue(data.orderKind) === "quote",
    });
    setStep(1);
  };

  const goToDetails = () => setStep(0);

  // Passo 2: cria o pedido, encadeia os itens e leva ao pedido recém-criado.
  const handleCreate = async () => {
    if (!orderDetails) return;

    await execute(
      async () => {
        const res = await createOrder({ variables: { input: orderDetails } });
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
        return { order, failed };
      },
      {
        successMessage: "Pedido criado com sucesso",
        onSuccess: ({ order, failed }) => {
          if (failed.length) {
            toast({
              variant: "error",
              title: "Alguns itens não foram adicionados",
              description: `${failed.join(", ")} — adicione no detalhe do pedido.`,
            });
          }
          // Não fecha o modal: o botão segue em loading até o pedido recém-criado
          // carregar; a navegação desmonta esta página (e o modal) ao entrar.
          redirect(`/orders/${order.id}`);
        },
      }
    );
  };

  return {
    open,
    setOpen: handleClose,
    step,
    formRef,
    formSteps,
    assignmentCount: assignmentOptions.length,
    handleDetailsValid,
    goToDetails,
    handleCreate,
    draft,
    // Inclui o redirect: o botão "Criar" só sai do loading quando o pedido novo
    // já carregou.
    isLoading: isLoading || isRedirecting,
  };
}
