import { useMutation } from "@apollo/client/react";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useMemo, useRef, useState } from "react";

import { FormBuilderRef, FormStepSchema } from "@/components/FormBuilder";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { ORDER_CACHE_FIELDS } from "@/utils/cacheFields";
import {
  extractSelectValue,
  parseDeliveryDays,
  parseCoverageDays,
} from "@/utils/form";
import { toIsoDate } from "@/utils/format/date";

import { DeferredOrderTarget } from "../../../../../_components/OrderImportWizard";
import {
  clientOptionLabel,
  clientOptionSearchText,
} from "../../../../../_shared/clientOption";
import {
  coverageHint,
  useCoverageSuggestion,
} from "../../../../../_shared/orderCoverage";
import { useCompanyFactoryNode } from "../../../../../_shared/orderItemCatalog";
import { usePaymentTermOptions } from "../../../../../_shared/orderPaymentTerms";
import { FREIGHT_OPTIONS } from "../../../../../_shared/orderFreight";
import {
  CREATE_ORDER_FROM_FACTORY_MUTATION,
  FACTORY_ASSIGNMENTS_QUERY,
  FactoryOrder,
} from "../gql";
import { CreateOrderResponse, FactoryAssignmentsData } from "../interface";

export interface ImportFactoryOrderProps {
  factoryId: string;
  /** Recarrega a lista de pedidos da fábrica após criar/importar. */
  onChanged: () => void;
  /** Insere a linha na aba assim que o pedido nasce, antes do refetch. */
  onAddOptimistic: (order: FactoryOrder) => void;
}

interface PendingOrder {
  sellerId: string;
  clientId: string;
  orderDate: string;
  paymentTermId: string | null;
  freightType: string | null;
  deliveryEstimateDays: number | null;
  coverageDays: number | null;
}

/**
 * Mesma experiência do "Importar pedido" da lista /orders, com a fábrica já
 * fixa: escolhe o vínculo vendedor→cliente e cai no OrderImportWizard — o
 * pedido SÓ é criado na confirmação final, junto com os itens.
 */
const getAssignments = (d: FactoryAssignmentsData) => d.sellerClientFactoryList;

export function useImportFactoryOrder({
  factoryId,
  onChanged,
  onAddOptimistic,
}: ImportFactoryOrderProps) {
  const [open, setOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [pending, setPending] = useState<PendingOrder | null>(null);
  // O que o formulário mostrava ao avançar: voltar do wizard o remonta, e sem o
  // rascunho ele voltaria vazio.
  const [detailsDraft, setDetailsDraft] = useState<Record<string, unknown>>();
  // O vínculo escolhido também vira estado: é dele que sai a sugestão de
  // "dura quantos dias na loja?".
  const [assignmentId, setAssignmentId] = useState("");
  // Memoiza o pedido criado na confirmação: re-tentativa não cria um segundo.
  const createdOrderIdRef = useRef<string | null>(null);
  const formRef = useRef<FormBuilderRef>(null);

  // Sem teto fixo: é o select de "vendedor → cliente" do pedido, e uma fábrica
  // com carteira grande passava do limite antigo — o cliente existia e a tela
  // dizia que não. O hook rebusca pelo total quando a 1ª página não dá conta.
  const assignmentsInput = useMemo(
    () => ({
      filters: [{ field: "factory_id", operator: "eq", value: factoryId }],
    }),
    [factoryId]
  );

  const { data: assignmentsData, error: assignmentsError } =
    useCompleteList<FactoryAssignmentsData>(
      FACTORY_ASSIGNMENTS_QUERY,
      assignmentsInput,
      getAssignments,
      { skip: !open }
    );

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

  // Só as opções: a importação não monta itens na tela (o wizard traz os do
  // arquivo), então o piso aparece apenas no rótulo da condição.
  const { options: paymentTermOptions } = usePaymentTermOptions(
    open,
    factoryId || null
  );
  const ipiInOrder =
    useCompanyFactoryNode(open, factoryId || null)?.ipiInOrder ?? false;

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
                onChange: (value) => setAssignmentId(extractSelectValue(value)),
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
            ],
          },
        ],
      },
    ],
    [assignmentOptions, paymentTermOptions, selectedAssignment]
  );

  const [createOrder] = useMutation<CreateOrderResponse>(
    CREATE_ORDER_FROM_FACTORY_MUTATION
  );
  const invalidateClient = useInvalidateQueriesClient();

  /**
   * Como no "Importar pedido" da lista /orders: a aba refaz o fetch (é ela que
   * está na tela) e o evict cuida das telas que o pedido novo também
   * desatualiza — /orders e seus KPIs, a ficha do cliente e a lista de
   * clientes. Sem a segunda metade, o pedido importado por aqui só aparecia
   * nelas depois de um F5.
   */
  const refetchList = () => {
    onChanged();
    void invalidateClient(ORDER_CACHE_FIELDS);
  };

  const handleClose = (value: boolean) => {
    if (!value && isBusy) return; // Não fecha durante a importação.
    setOpen(value);
    if (!value) {
      if (createdOrderIdRef.current) refetchList(); // Pedido criado: lista reflete.
      setPending(null);
      createdOrderIdRef.current = null;
      setAssignmentId("");
      setDetailsDraft(undefined);
      formRef.current?.resetForm();
    }
  };

  // Formulário válido: guarda os dados e avança para o wizard — SEM criar nada.
  const handleDetailsValid = (data: Record<string, unknown>) => {
    const assignmentId = extractSelectValue(data.assignment);
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (!assignment) return;
    setDetailsDraft(data);
    setPending({
      sellerId: assignment.sellerId,
      clientId: assignment.clientId,
      orderDate: toIsoDate(data.orderDate),
      paymentTermId: extractSelectValue(data.paymentTermId) || null,
      freightType: extractSelectValue(data.freightType) || null,
      deliveryEstimateDays: parseDeliveryDays(data.deliveryEstimateDays),
      // Estimativa de campo do vendedor; o backend descarta fora da faixa plausivel.
      coverageDays: parseCoverageDays(data.coverageDays),
    });
  };

  /**
   * Volta ao passo do modal, saindo do wizard. Zerar o `pending` é o que
   * devolve a tela — e nada foi gravado até aqui, então voltar não deixa rastro.
   */
  const goToLeadingStep = () => setPending(null);

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
        const order = res.data.createOrder.data;
        createdOrderIdRef.current = order.id;
        // A linha entra na aba já com o que a mutation devolve; o refetch do
        // fechamento substitui pela do servidor. `notes` não vem no retorno e
        // nasce vazio de qualquer forma.
        onAddOptimistic({ ...order, notes: null });
        return createdOrderIdRef.current;
      },
    };
  }, [pending, factoryId, createOrder, onAddOptimistic]);

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
    refetchList,
    formRef,
    formSteps,
    handleDetailsValid,
    goToLeadingStep,
    /** O que o formulário tinha ao avançar — para ele voltar preenchido. */
    detailsDraft,
  };
}
