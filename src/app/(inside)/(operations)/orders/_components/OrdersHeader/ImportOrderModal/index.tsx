"use client";

import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import { Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";

import { Order } from "../../../interface";
import { OrderImportWizard } from "../../../[id]/_components/OrderItemsTable/ImportOrderModal/OrderImportWizard";
import {
  CREATE_ORDER_MUTATION,
  ORDER_SELLER_CLIENTS_QUERY,
  ORDER_SELLER_FACTORIES_QUERY,
  ORDER_SELLERS_OPTIONS_QUERY,
} from "../AddOrderModal/gql";
import { CreateOrderResponse } from "../AddOrderModal/interface";
import { normalizeInput } from "../AddOrderModal/utils";

interface SellersOptionsData {
  order_sellers_options: { edges: { node: { id: string; name: string } }[] };
}
interface SellerFactoriesData {
  sellerFactoryAccessList: {
    edges: {
      node: {
        factoryId: string;
        factory: { id: string; nomeFantasia: string | null; razaoSocial: string } | null;
      };
    }[];
  };
}
interface SellerClientsData {
  sellerClientFactoryList: {
    edges: {
      node: {
        clientId: string;
        client: { id: string; razaoSocial: string; nomeFantasia: string | null } | null;
      };
    }[];
  };
}

const LIST_INPUT = { first: 200 };

const extractValue = (raw: unknown): string =>
  raw && typeof raw === "object" && "value" in raw
    ? String((raw as { value: string }).value)
    : String(raw ?? "");

/**
 * Cria um pedido (vendedor → fábrica → cliente → data) e já importa os itens
 * a partir do arquivo da fábrica, num fluxo só — para a lista /orders, onde
 * ainda não existe pedido. Reaproveita o OrderImportWizard.
 */
export function ImportOrderModal({
  onAddOptimistic,
}: {
  onAddOptimistic: (order: Order) => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [sellerId, setSellerId] = useState("");
  const [factoryId, setFactoryId] = useState("");

  const formRef = useRef<FormBuilderRef>(null);
  const client = useApolloClient();
  const { execute, isLoading } = useAsyncAction();
  const [createOrder] = useMutation<CreateOrderResponse>(CREATE_ORDER_MUTATION);

  const { data: sellersData } = useQuery<SellersOptionsData>(ORDER_SELLERS_OPTIONS_QUERY, {
    variables: { input: LIST_INPUT },
    skip: !open,
  });
  const { data: factoriesData } = useQuery<SellerFactoriesData>(ORDER_SELLER_FACTORIES_QUERY, {
    variables: {
      input: { ...LIST_INPUT, filters: [{ field: "seller_id", operator: "eq", value: sellerId }] },
    },
    skip: !open || !sellerId,
  });
  const { data: clientsData } = useQuery<SellerClientsData>(ORDER_SELLER_CLIENTS_QUERY, {
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
  });

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
      if (node.factory) map.set(node.factoryId, node.factory.nomeFantasia ?? node.factory.razaoSocial);
    });
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [factoriesData]);
  const clientOptions = useMemo(() => {
    const map = new Map<string, string>();
    clientsData?.sellerClientFactoryList?.edges?.forEach(({ node }) => {
      if (node.client) map.set(node.clientId, node.client.nomeFantasia ?? node.client.razaoSocial);
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
                  setSellerId(extractValue(value));
                  setFactoryId("");
                  setValue("factoryId", "");
                  setValue("clientId", "");
                },
              },
              {
                name: "factoryId",
                type: "select-single",
                label: "Fábrica",
                placeholder: sellerId ? "Selecione a fábrica" : "Selecione o vendedor primeiro",
                required: true,
                disabled: !sellerId,
                options: factoryOptions,
                onChange: (value, setValue) => {
                  setFactoryId(extractValue(value));
                  setValue("clientId", "");
                },
              },
              {
                name: "clientId",
                type: "select-single",
                label: "Cliente",
                placeholder: factoryId ? "Selecione o cliente" : "Selecione a fábrica primeiro",
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
    client.refetchQueries({ include: ["Orders", "OrderStats"] });
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
          throw new Error(res.data?.createOrder?.message ?? "Erro ao criar pedido");
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

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="outline" color="neutral" size="md">
          <Button.Icon icon={Upload} />
          <Button.Title>Importar pedido</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="5xl">
        <Modal.Header
          title="Importar pedido"
          description={
            orderId
              ? "Suba o arquivo da fábrica (PDF ou Excel): casamos os produtos e você confere antes de gravar."
              : "Escolha o vendedor, a fábrica e o cliente para criar o pedido. Em seguida você sobe o arquivo."
          }
        />

        {orderId ? (
          <OrderImportWizard
            orderId={orderId}
            onImported={refetchList}
            onBusyChange={setBusy}
            onClose={() => handleClose(false)}
          />
        ) : (
          <>
            <Modal.Body>
              <FormBuilder
                ref={formRef}
                steps={formSteps}
                onSubmit={handleCreate}
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
                <Button.Title>Continuar</Button.Title>
              </Button.Root>
            </Modal.Footer>
          </>
        )}
      </Modal.Content>
    </Modal.Root>
  );
}
