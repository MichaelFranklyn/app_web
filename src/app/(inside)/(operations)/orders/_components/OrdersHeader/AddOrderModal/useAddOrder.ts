import { FormBuilderRef, FormStepSchema } from "@/components/FormBuilder";
import { SelectOption } from "@/components/Input";
import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useRedirectTransition } from "@/hooks/useRedirectTransition";
import { extractSelectValue } from "@/utils/form";
import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useRef, useState } from "react";

import { Order } from "../../../interface";
import {
  CREATE_ORDER_MUTATION,
  ORDER_SELLER_CLIENTS_QUERY,
  ORDER_SELLER_FACTORIES_QUERY,
  ORDER_SELLERS_OPTIONS_QUERY,
} from "../gql";
import { CreateOrderResponse } from "../interface";
import { CreateOrderInput } from "../interface";
import { normalizeInput } from "../utils";
import {
  CREATE_ORDER_ITEM_MUTATION,
  CreateOrderItemResponse,
  createDraftItems,
  useOrderDraftItems,
} from "../../../../_shared/orderDraftItems";
import { usePaymentTermOptions } from "../../../../_shared/orderPaymentTerms";
import {
  FREIGHT_OPTIONS,
  useFreeFreightTarget,
} from "../../../../_shared/orderFreight";
import {
  clientOptionLabel,
  clientOptionSearchText,
} from "../../../../_shared/clientOption";
import {
  CoverageCadence,
  cadenceByClientFrom,
  coverageHint,
  useCoverageSuggestion,
} from "../../../../_shared/orderCoverage";

interface SellersOptionsData {
  order_sellers_options: { edges: { node: { id: string; name: string } }[] };
}

interface SellerFactoriesData {
  sellerFactoryAccessList: {
    edges: {
      node: {
        factoryId: string;
        factory: {
          id: string;
          nomeFantasia: string | null;
          razaoSocial: string;
        } | null;
      };
    }[];
  };
}

interface SellerClientsData {
  sellerClientFactoryList: {
    edges: {
      node: {
        clientId: string;
        client: {
          id: string;
          razaoSocial: string;
          nomeFantasia: string | null;
          cnpj: string | null;
        } | null;
        cadence: CoverageCadence | null;
      };
    }[];
  };
}

const LIST_INPUT = { first: 200 };

export interface AddOrderModalProps {
  onAddOptimistic: (order: Order) => void;
}

export function useAddOrder({ onAddOptimistic }: AddOrderModalProps) {
  const [open, setOpen] = useState(false);
  // 0 = dados do pedido, 1 = itens (opcional).
  const [step, setStep] = useState(0);
  const formRef = useRef<FormBuilderRef>(null);
  // Sai da lista logo depois de criar: invalidar (evict) deixa a listagem
  // pronta para o próximo mount, sem refetch de uma tela que vai desmontar.
  const invalidateClient = useInvalidateQueriesClient();
  const { redirect, isRedirecting } = useRedirectTransition();
  const { toast } = useToast();

  // Seleção em cascata: vendedor → fábrica → cliente.
  const [sellerId, setSellerId] = useState("");
  const [factoryId, setFactoryId] = useState("");
  // O cliente também é estado (não só campo do form) porque o passo 2 usa o
  // nível acordado com ele para sugerir o preço dos itens.
  const [clientId, setClientId] = useState("");
  // Dados validados do passo 1, usados ao criar o pedido no passo 2.
  const [orderDetails, setOrderDetails] = useState<CreateOrderInput | null>(
    null
  );

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

  const { data: sellersData } = useQuery<SellersOptionsData>(
    ORDER_SELLERS_OPTIONS_QUERY,
    { variables: { input: LIST_INPUT }, skip: !open }
  );

  const { data: factoriesData } = useQuery<SellerFactoriesData>(
    ORDER_SELLER_FACTORIES_QUERY,
    {
      variables: {
        input: {
          ...LIST_INPUT,
          filters: [{ field: "seller_id", operator: "eq", value: sellerId }],
        },
      },
      skip: !open || !sellerId,
    }
  );

  const { data: clientsData } = useQuery<SellerClientsData>(
    ORDER_SELLER_CLIENTS_QUERY,
    {
      variables: {
        input: {
          ...LIST_INPUT,
          filters: [
            { field: "seller_id", operator: "eq", value: sellerId },
            { field: "factory_id", operator: "eq", value: factoryId },
          ],
        },
      },
      skip: !open || !sellerId || !factoryId,
    }
  );

  const sellerOptions = useMemo(
    () =>
      sellersData?.order_sellers_options?.edges?.map(({ node }) => ({
        label: node.name,
        value: node.id,
      })) ?? [],
    [sellersData]
  );

  const factoryOptions = useMemo(() => {
    const map = new Map<string, string>();
    factoriesData?.sellerFactoryAccessList?.edges?.forEach(({ node }) => {
      if (node.factory) {
        map.set(
          node.factoryId,
          node.factory.nomeFantasia ?? node.factory.razaoSocial
        );
      }
    });
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [factoriesData]);

  const clientOptions = useMemo(() => {
    const map = new Map<string, SelectOption>();
    clientsData?.sellerClientFactoryList?.edges?.forEach(({ node }) => {
      if (node.client) {
        map.set(node.clientId, {
          value: node.clientId,
          label: clientOptionLabel(node.client),
          searchText: clientOptionSearchText(node.client),
        });
      }
    });
    return Array.from(map.values());
  }, [clientsData]);

  // A cadência de cada cliente nesta fábrica: é dela que sai a sugestão de
  // cobertura. Vem na mesma consulta das opções — nenhuma requisição a mais.
  const cadenceByClient = useMemo(
    () => cadenceByClientFrom(clientsData?.sellerClientFactoryList?.edges),
    [clientsData]
  );

  useCoverageSuggestion(formRef, cadenceByClient.get(clientId), open);

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
                name: "sellerId",
                type: "select-single",
                label: "Vendedor",
                placeholder: "Selecione o vendedor",
                required: true,
                options: sellerOptions,
                onChange: (value, setValue) => {
                  setSellerId(extractSelectValue(value));
                  setFactoryId("");
                  setClientId("");
                  setValue("factoryId", "");
                  setValue("clientId", "");
                },
              },
              {
                name: "factoryId",
                type: "select-single",
                label: "Fábrica",
                placeholder: sellerId
                  ? "Selecione a fábrica"
                  : "Selecione o vendedor primeiro",
                required: true,
                disabled: !sellerId,
                options: factoryOptions,
                onChange: (value, setValue) => {
                  setFactoryId(extractSelectValue(value));
                  setClientId("");
                  setValue("clientId", "");
                  // Condições de pagamento são da fábrica: trocar de fábrica
                  // invalida a escolhida.
                  setValue("paymentTermId", "");
                },
              },
              {
                name: "clientId",
                type: "select-single",
                label: "Cliente",
                placeholder: factoryId
                  ? "Selecione o cliente"
                  : "Selecione a fábrica primeiro",
                required: true,
                disabled: !factoryId,
                options: clientOptions,
                onChange: (value) => setClientId(extractSelectValue(value)),
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
                  ? "Selecione a fábrica primeiro"
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
                hint: coverageHint(cadenceByClient.get(clientId)),
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
      sellerOptions,
      factoryOptions,
      clientOptions,
      sellerId,
      factoryId,
      paymentTermOptions,
      // A dica do campo de cobertura muda com o cliente escolhido: ela diz de
      // onde veio o número sugerido, e é isso que faz o vendedor corrigi-lo.
      cadenceByClient,
      clientId,
    ]
  );

  const [createOrder] = useMutation<CreateOrderResponse>(CREATE_ORDER_MUTATION);
  const [createOrderItem] = useMutation<CreateOrderItemResponse>(
    CREATE_ORDER_ITEM_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) {
      formRef.current?.resetForm();
      setStep(0);
      setSellerId("");
      setFactoryId("");
      setClientId("");
      setOrderDetails(null);
      draft.reset();
    }
  };

  // Passo 1 válido: guarda os dados e avança para os itens.
  const handleDetailsValid = (data: Record<string, unknown>) => {
    setOrderDetails(normalizeInput(data));
    setStep(1);
  };

  const goToDetails = () => setStep(0);

  // Passo 2: cria o pedido e, em seguida, cada item do rascunho.
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

        // Itens são gravados após o pedido existir (o backend não os aceita no
        // CreateOrderInput). Falhas parciais não desfazem o pedido.
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
          onAddOptimistic(order);
          invalidateClient(["orders", "orderStats"]);
          if (failed.length) {
            toast({
              variant: "error",
              title: "Alguns itens não foram adicionados",
              description: `${failed.join(", ")} — adicione no detalhe do pedido.`,
            });
          }
          // Não fecha o modal: o botão segue em loading até o pedido novo
          // carregar, e a navegação desmonta esta página (com o modal) ao
          // entrar. Fechar antes daria "concluído" com a tela ainda em branco.
          redirect(`/orders/${order.id}`);
        },
      }
    );
  };

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
    // Inclui o redirect: o botão "Criar pedido" só sai do loading quando o
    // pedido recém-criado já carregou.
    isLoading: isLoading || isRedirecting,
  };
}
