import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useRef, useState } from "react";

import { FormBuilderRef, FormStepSchema } from "@/components/FormBuilder";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useRefetchQueriesClient } from "@/hooks/useInvalidateQueries";
import { extractSelectValue } from "@/utils/form";

import { Order } from "../../../interface";
import {
  CREATE_ORDER_MUTATION,
  ORDER_SELLER_CLIENTS_QUERY,
  ORDER_SELLER_FACTORIES_QUERY,
  ORDER_SELLERS_OPTIONS_QUERY,
} from "../gql";
import { CreateOrderResponse } from "../interface";
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
  const [busy, setBusy] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [sellerId, setSellerId] = useState("");
  const [factoryId, setFactoryId] = useState("");

  const formRef = useRef<FormBuilderRef>(null);
  const refetchClient = useRefetchQueriesClient();
  const { execute, isLoading } = useAsyncAction();
  const [createOrder] = useMutation<CreateOrderResponse>(CREATE_ORDER_MUTATION);

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
    const map = new Map<string, string>();
    clientsData?.sellerClientFactoryList?.edges?.forEach(({ node }) => {
      if (node.client)
        map.set(
          node.clientId,
          node.client.nomeFantasia ?? node.client.razaoSocial
        );
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
            ],
          },
        ],
      },
    ],
    [sellerOptions, factoryOptions, clientOptions, sellerId, factoryId]
  );

  const refetchList = () => {
    refetchClient(["Orders", "OrderStats"]);
  };

  const handleClose = (value: boolean) => {
    if (!value && (busy || isLoading)) return; // Não fecha durante criação/importação.
    setOpen(value);
    if (!value) {
      if (orderId) refetchList(); // Pedido criado: garante que a lista reflita.
      setOrderId(null);
      setSellerId("");
      setFactoryId("");
      formRef.current?.resetForm();
    }
  };

  const handleCreate = async (data: Record<string, unknown>) => {
    const input = normalizeInput(data);
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
        successMessage: "Pedido criado. Agora importe os itens.",
        onSuccess: (order) => {
          onAddOptimistic(order);
          setOrderId(order.id); // Avança para o wizard de importação.
        },
      }
    );
  };

  return {
    open,
    handleClose,
    orderId,
    setBusy,
    refetchList,
    formRef,
    formSteps,
    handleCreate,
    isLoading,
  };
}
