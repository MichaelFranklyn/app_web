import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useRef, useState } from "react";

import { FormBuilderRef, FormStepSchema } from "@/components/FormBuilder";
import { SelectOption } from "@/components/Input";
import { useRefetchQueriesClient } from "@/hooks/useInvalidateQueries";
import { extractSelectValue } from "@/utils/form";

import { DeferredOrderTarget } from "../../../../_components/OrderImportWizard";
import {
  clientOptionLabel,
  clientOptionSearchText,
} from "../../../../_shared/clientOption";
import { useCompanyFactoryNode } from "../../../../_shared/orderItemCatalog";
import { usePaymentTermOptions } from "../../../../_shared/orderPaymentTerms";
import { FREIGHT_OPTIONS } from "../../../../_shared/orderFreight";
import { Order } from "../../../interface";
import {
  CREATE_ORDER_MUTATION,
  ORDER_SELLER_CLIENTS_QUERY,
  ORDER_SELLER_FACTORIES_QUERY,
  ORDER_SELLERS_OPTIONS_QUERY,
} from "../gql";
import { CreateOrderInput, CreateOrderResponse } from "../interface";
import { normalizeInput } from "../utils";

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
      };
    }[];
  };
}

const LIST_INPUT = { first: 200 };

export interface ImportOrderModalProps {
  onAddOptimistic: (order: Order) => void;
}

export function useImportOrder({ onAddOptimistic }: ImportOrderModalProps) {
  const [open, setOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  // Dados validados do formulário — o pedido em si SÓ é criado na confirmação
  // final do wizard (desistir no meio não deixa pedido vazio para trás).
  const [pending, setPending] = useState<CreateOrderInput | null>(null);
  const [sellerId, setSellerId] = useState("");
  const [factoryId, setFactoryId] = useState("");
  // Id do pedido criado pela confirmação — memoizado para uma re-tentativa
  // (ex.: falha de rede ao gravar itens) não criar um segundo pedido.
  const createdOrderIdRef = useRef<string | null>(null);

  const formRef = useRef<FormBuilderRef>(null);
  const refetchClient = useRefetchQueriesClient();
  const [createOrder] = useMutation<CreateOrderResponse>(CREATE_ORDER_MUTATION);

  const paymentTermOptions = usePaymentTermOptions(open, factoryId || null);
  const ipiInOrder =
    useCompanyFactoryNode(open, factoryId || null)?.ipiInOrder ?? false;

  const { data: sellersData } = useQuery<SellersOptionsData>(
    ORDER_SELLERS_OPTIONS_QUERY,
    {
      variables: { input: LIST_INPUT },
      skip: !open,
    }
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
      if (node.factory)
        map.set(
          node.factoryId,
          node.factory.nomeFantasia ?? node.factory.razaoSocial
        );
    });
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [factoriesData]);
  const clientOptions = useMemo(() => {
    const map = new Map<string, SelectOption>();
    clientsData?.sellerClientFactoryList?.edges?.forEach(({ node }) => {
      if (node.client)
        map.set(node.clientId, {
          value: node.clientId,
          label: clientOptionLabel(node.client),
          searchText: clientOptionSearchText(node.client),
        });
    });
    return Array.from(map.values());
  }, [clientsData]);

  const formSteps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "order",
        sections: [
          {
            id: "details",
            title: "Para qual pedido?",
            fields: [
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
                  setValue("clientId", "");
                  // Condições de pagamento são da fábrica: trocar invalida a escolha.
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
    ]
  );

  const refetchList = () => {
    refetchClient(["Orders", "OrderStats"]);
  };

  const handleClose = (value: boolean) => {
    if (!value && isBusy) return; // Não fecha durante a importação.
    setOpen(value);
    if (!value) {
      if (createdOrderIdRef.current) refetchList(); // Pedido criado: lista reflete.
      setPending(null);
      createdOrderIdRef.current = null;
      setSellerId("");
      setFactoryId("");
      formRef.current?.resetForm();
    }
  };

  // Formulário válido: guarda os dados e avança para o wizard — SEM criar nada.
  const handleDetailsValid = (data: Record<string, unknown>) => {
    setPending(normalizeInput(data));
  };

  // Alvo adiado do wizard: o pedido nasce na confirmação final da importação.
  const deferred: DeferredOrderTarget | null = useMemo(() => {
    if (!pending) return null;
    return {
      factoryId: pending.factoryId,
      clientId: pending.clientId,
      createOrder: async () => {
        if (createdOrderIdRef.current) return createdOrderIdRef.current;
        const res = await createOrder({ variables: { input: pending } });
        if (!res.data?.createOrder?.status || !res.data.createOrder.data) {
          throw new Error(
            res.data?.createOrder?.message ?? "Erro ao criar pedido"
          );
        }
        const order = res.data.createOrder.data;
        createdOrderIdRef.current = order.id;
        onAddOptimistic(order);
        return order.id;
      },
    };
  }, [pending, createOrder, onAddOptimistic]);

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
  };
}
