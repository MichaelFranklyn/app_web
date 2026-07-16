import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useRef, useState } from "react";

import { FormBuilderRef, FormStepSchema } from "@/components/FormBuilder";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { extractSelectValue } from "@/utils/form";
import { toIsoDate } from "@/utils/format/date";

import { DeferredOrderTarget } from "../../../../../_components/OrderImportWizard";
import { useCompanyFactoryNode } from "../../../../../_shared/orderItemCatalog";
import { usePaymentTermOptions } from "../../../../../_shared/orderPaymentTerms";
import { FREIGHT_OPTIONS } from "../../../../../_shared/orderFreight";
import {
  CREATE_ORDER_FROM_FACTORY_MUTATION,
  FACTORY_ASSIGNMENTS_QUERY,
} from "../gql";
import { CreateOrderResponse, FactoryAssignmentsData } from "../interface";

export interface ImportFactoryOrderProps {
  factoryId: string;
  /** Recarrega a lista de pedidos da fábrica após criar/importar. */
  onChanged: () => void;
}

const clientLabel = (c: {
  razaoSocial: string;
  nomeFantasia: string | null;
}): string => c.nomeFantasia ?? c.razaoSocial;

interface PendingOrder {
  sellerId: string;
  clientId: string;
  orderDate: string;
  paymentTermId: string | null;
  freightType: string | null;
}

/**
 * Mesma experiência do "Importar pedido" da lista /orders, com a fábrica já
 * fixa: escolhe o vínculo vendedor→cliente e cai no OrderImportWizard — o
 * pedido SÓ é criado na confirmação final, junto com os itens.
 */
export function useImportFactoryOrder({
  factoryId,
  onChanged,
}: ImportFactoryOrderProps) {
  const [open, setOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [pending, setPending] = useState<PendingOrder | null>(null);
  // Memoiza o pedido criado na confirmação: re-tentativa não cria um segundo.
  const createdOrderIdRef = useRef<string | null>(null);
  const formRef = useRef<FormBuilderRef>(null);

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

  const paymentTermOptions = usePaymentTermOptions(open, factoryId || null);
  const ipiInOrder =
    useCompanyFactoryNode(open, factoryId || null)?.ipiInOrder ?? false;

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
            title: "Para qual pedido?",
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

  const handleClose = (value: boolean) => {
    if (!value && isBusy) return; // Não fecha durante a importação.
    setOpen(value);
    if (!value) {
      if (createdOrderIdRef.current) onChanged(); // Pedido criado: lista reflete.
      setPending(null);
      createdOrderIdRef.current = null;
      formRef.current?.resetForm();
    }
  };

  // Formulário válido: guarda os dados e avança para o wizard — SEM criar nada.
  const handleDetailsValid = (data: Record<string, unknown>) => {
    const assignmentId = extractSelectValue(data.assignment);
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (!assignment) return;
    setPending({
      sellerId: assignment.sellerId,
      clientId: assignment.clientId,
      orderDate: toIsoDate(data.orderDate),
      paymentTermId: extractSelectValue(data.paymentTermId) || null,
      freightType: extractSelectValue(data.freightType) || null,
    });
  };

  // Alvo adiado do wizard: o pedido nasce na confirmação final da importação.
  const deferred: DeferredOrderTarget | null = useMemo(() => {
    if (!pending) return null;
    return {
      factoryId,
      clientId: pending.clientId,
      createOrder: async () => {
        if (createdOrderIdRef.current) return createdOrderIdRef.current;
        const res = await createOrder({
          variables: { input: { ...pending, factoryId } },
        });
        if (!res.data?.createOrder?.status || !res.data.createOrder.data) {
          throw new Error(
            res.data?.createOrder?.message ?? "Erro ao criar pedido"
          );
        }
        createdOrderIdRef.current = res.data.createOrder.data.id;
        return createdOrderIdRef.current;
      },
    };
  }, [pending, factoryId, createOrder]);

  useQueryErrorToast(
    assignmentsError,
    "Não foi possível carregar os vínculos. Tente novamente."
  );

  return {
    open,
    handleClose,
    deferred,
    ipiInOrder,
    setIsBusy,
    formRef,
    formSteps,
    handleDetailsValid,
  };
}
