import { FormBuilderRef, FormStepSchema } from "@/components/FormBuilder";
import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useRefetchQueriesClient } from "@/hooks/useInvalidateQueries";
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
import { CREATE_ORDER_ITEM_MUTATION } from "./gql";
import { CreateOrderItemResponse } from "./interface";
import { useOrderDraftItems } from "./useOrderDraftItems";
import { FREIGHT_OPTIONS } from "./utils";

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
        } | null;
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
  const refetchClient = useRefetchQueriesClient();
  const { toast } = useToast();

  // Seleção em cascata: vendedor → fábrica → cliente.
  const [sellerId, setSellerId] = useState("");
  const [factoryId, setFactoryId] = useState("");
  // Dados validados do passo 1, usados ao criar o pedido no passo 2.
  const [orderDetails, setOrderDetails] = useState<CreateOrderInput | null>(
    null
  );

  const draft = useOrderDraftItems(open, factoryId);

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
    const map = new Map<string, string>();
    clientsData?.sellerClientFactoryList?.edges?.forEach(({ node }) => {
      if (node.client) {
        map.set(
          node.clientId,
          node.client.nomeFantasia ?? node.client.razaoSocial
        );
      }
    });
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [clientsData]);

  const formSteps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "order",
        sections: [
          {
            id: "details",
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
    [sellerOptions, factoryOptions, clientOptions, sellerId, factoryId]
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

        // Itens são gravados após o pedido existir. Se algum falhar, o pedido
        // permanece criado e o vendedor completa no detalhe.
        const failed: string[] = [];
        for (const item of draft.items) {
          try {
            const r = await createOrderItem({
              variables: {
                input: {
                  orderId: order.id,
                  productId: item.productId,
                  tierId: item.tierId || null,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  discount: item.discount,
                  source: "MANUAL",
                },
              },
            });
            if (!r.data?.createOrderItem?.status) {
              failed.push(item.productLabel);
            }
          } catch {
            failed.push(item.productLabel);
          }
        }
        return { order, failed };
      },
      {
        successMessage: "Pedido criado com sucesso",
        onSuccess: ({ order, failed }) => {
          onAddOptimistic(order);
          refetchClient(["Orders", "OrderStats"]);
          if (failed.length) {
            toast({
              variant: "error",
              title: "Alguns itens não foram adicionados",
              description: `${failed.join(", ")} — adicione no detalhe do pedido.`,
            });
          }
          handleClose(false);
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
    isLoading,
  };
}
