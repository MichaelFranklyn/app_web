"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import { Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Order } from "../../../interface";
import {
  CREATE_ORDER_MUTATION,
  ORDER_SELLER_CLIENTS_QUERY,
  ORDER_SELLER_FACTORIES_QUERY,
  ORDER_SELLERS_OPTIONS_QUERY,
} from "./gql";
import { CreateOrderResponse } from "./interface";
import { normalizeInput, FREIGHT_OPTIONS } from "./utils";

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

const extractValue = (raw: unknown): string =>
  raw && typeof raw === "object" && "value" in raw
    ? String((raw as { value: string }).value)
    : String(raw ?? "");

export function AddOrderModal({
  onAddOptimistic,
}: {
  onAddOptimistic: (order: Order) => void;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const client = useApolloClient();

  // Seleção em cascata: vendedor → fábrica → cliente.
  const [sellerId, setSellerId] = useState("");
  const [factoryId, setFactoryId] = useState("");

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
            title: "Dados do pedido",
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
                placeholder: sellerId
                  ? "Selecione a fábrica"
                  : "Selecione o vendedor primeiro",
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
  const { execute, isLoading } = useAsyncAction();

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) {
      formRef.current?.resetForm();
      setSellerId("");
      setFactoryId("");
    }
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    const normalized = normalizeInput(data);

    await execute(
      async () => {
        const res = await createOrder({ variables: { input: normalized } });

        if (!res.data?.createOrder?.status || !res.data.createOrder.data) {
          throw new Error(
            res.data?.createOrder?.message ?? "Erro ao criar pedido"
          );
        }

        return res.data.createOrder.data;
      },
      {
        successMessage: "Pedido iniciado com sucesso",
        onSuccess: (newOrder) => {
          handleClose(false);
          onAddOptimistic(newOrder);
          // Refaz o fetch da listagem e dos KPIs (ambos ativos em /orders)
          // para refletirem o novo pedido, mantendo os dados visíveis.
          client.refetchQueries({ include: ["Orders", "OrderStats"] });
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="md">
          <Button.Icon icon={Plus} />
          <Button.Title>Novo Pedido</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Novo pedido"
          description="Selecione o vendedor, a fábrica e o cliente para iniciar o pedido."
        />

        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={formSteps}
            onSubmit={handleSubmit}
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
            <Button.Title>Criar pedido</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
