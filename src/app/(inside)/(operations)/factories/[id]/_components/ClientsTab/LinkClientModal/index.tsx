"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useMutation, useQuery } from "@apollo/client/react";
import { Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { PRIORITY_OPTIONS } from "../utils";
import {
  COMPANY_CLIENTS_FOR_LINK_QUERY,
  CREATE_SELLER_CLIENT_FACTORY_MUTATION,
  EXISTING_LINKS_QUERY,
  PRICE_TIERS_FOR_LINK_QUERY,
  SELLERS_WITH_ACCESS_QUERY,
} from "./gql";

interface CompanyClientsData {
  companyClients: {
    edges: {
      node: {
        id: string;
        isActive: boolean;
        client: {
          id: string;
          razaoSocial: string;
          nomeFantasia: string | null;
        } | null;
      };
    }[];
  };
}

interface SellersAccessData {
  sellerFactoryAccessList: {
    edges: {
      node: {
        id: string;
        sellerId: string;
        isActive: boolean;
        seller: { id: string; name: string } | null;
      };
    }[];
  };
}

interface TiersData {
  priceTiers: { edges: { node: { id: string; name: string } }[] };
}

interface ExistingLinksData {
  sellerClientFactoryList: {
    edges: { node: { id: string; clientId: string } }[];
  };
}

interface CreateResponse {
  createSellerClientFactory: {
    status: boolean;
    message: string;
    data: { id: string } | null;
  };
}

interface Props {
  factoryId: string;
  companyFactoryId: string;
}

const extractValue = (raw: unknown): string =>
  raw && typeof raw === "object" && "value" in raw
    ? String((raw as { value: string }).value)
    : String(raw ?? "");

export function LinkClientModal({ factoryId, companyFactoryId }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const invalidateClient = useInvalidateQueriesClient();
  const { execute, isLoading } = useAsyncAction();

  const byFactory = {
    first: 200,
    filters: [{ field: "factory_id", operator: "eq", value: factoryId }],
  };

  const { data: clientsData } = useQuery<CompanyClientsData>(
    COMPANY_CLIENTS_FOR_LINK_QUERY,
    { variables: { input: { first: 200 } }, skip: !open }
  );

  const { data: sellersData } = useQuery<SellersAccessData>(
    SELLERS_WITH_ACCESS_QUERY,
    { variables: { input: byFactory }, skip: !open }
  );

  const { data: tiersData } = useQuery<TiersData>(PRICE_TIERS_FOR_LINK_QUERY, {
    variables: {
      input: {
        first: 200,
        filters: [
          {
            field: "company_factory_id",
            operator: "eq",
            value: companyFactoryId,
          },
        ],
      },
    },
    skip: !open,
  });

  const { data: existingData } = useQuery<ExistingLinksData>(
    EXISTING_LINKS_QUERY,
    { variables: { input: byFactory }, skip: !open }
  );

  const linkedClientIds = useMemo(
    () =>
      new Set(
        existingData?.sellerClientFactoryList?.edges?.map(
          ({ node }) => node.clientId
        ) ?? []
      ),
    [existingData]
  );

  const clientOptions = useMemo(
    () =>
      clientsData?.companyClients?.edges
        ?.filter(
          ({ node }) =>
            node.isActive &&
            node.client &&
            !linkedClientIds.has(node.client.id)
        )
        .map(({ node }) => ({
          label: node.client!.nomeFantasia || node.client!.razaoSocial,
          value: node.client!.id,
        })) ?? [],
    [clientsData, linkedClientIds]
  );

  const sellerOptions = useMemo(
    () =>
      sellersData?.sellerFactoryAccessList?.edges
        ?.filter(({ node }) => node.isActive && node.seller)
        .map(({ node }) => ({
          label: node.seller!.name,
          value: node.seller!.id,
        })) ?? [],
    [sellersData]
  );

  const tierOptions = useMemo(
    () =>
      tiersData?.priceTiers?.edges?.map(({ node }) => ({
        label: node.name,
        value: node.id,
      })) ?? [],
    [tiersData]
  );

  const formSteps = useMemo<FormStepSchema[]>(
    () => [
      {
        id: "link",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "clientId",
                type: "select-single",
                label: "Cliente",
                placeholder:
                  clientOptions.length === 0
                    ? "Nenhum cliente disponível na carteira"
                    : "Selecione o cliente",
                required: true,
                options: clientOptions,
              },
              {
                name: "sellerId",
                type: "select-single",
                label: "Vendedor",
                placeholder:
                  sellerOptions.length === 0
                    ? "Nenhum vendedor com acesso a esta fábrica"
                    : "Selecione o vendedor",
                required: true,
                options: sellerOptions,
              },
              {
                name: "priceTierId",
                type: "select-single",
                label: "Nível da tabela de preço",
                placeholder:
                  tierOptions.length === 0
                    ? "Fábrica sem níveis cadastrados"
                    : "Selecione o nível do cliente",
                required: true,
                options: tierOptions,
                hint: "Nível de preço acordado com este cliente. A importação de pedidos usa este nível como referência para conferir o preço.",
              },
              {
                name: "priority",
                type: "select-single",
                label: "Prioridade",
                placeholder: "Selecione a prioridade",
                options: PRIORITY_OPTIONS,
              },
            ],
          },
        ],
      },
    ],
    [clientOptions, sellerOptions, tierOptions]
  );

  const [linkClient] = useMutation<CreateResponse>(
    CREATE_SELLER_CLIENT_FACTORY_MUTATION
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const clientId = extractValue(data.clientId);
    const sellerId = extractValue(data.sellerId);
    const priceTierId = extractValue(data.priceTierId);
    const priority = extractValue(data.priority);
    if (!clientId || !sellerId || !priceTierId) return;

    const input: Record<string, unknown> = {
      clientId,
      sellerId,
      factoryId,
      priceTierId,
      ...(priority ? { priority } : {}),
    };

    await execute(
      async () => {
        const res = await linkClient({ variables: { input } });
        if (!res.data?.createSellerClientFactory?.status) {
          throw new Error(
            res.data?.createSellerClientFactory?.message ??
              "Erro ao vincular cliente"
          );
        }
        return res.data.createSellerClientFactory.data;
      },
      {
        successMessage: "Cliente vinculado com sucesso",
        onSuccess: async () => {
          setOpen(false);
          formRef.current?.resetForm();
          await invalidateClient([
            "factory_client_links",
            "sellerClientFactoryList",
          ]);
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="sm" noUppercase>
          <Button.Icon icon={Plus} />
          <Button.Title>Vincular cliente</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Vincular cliente à fábrica"
          description="Conecta um cliente da sua carteira a esta fábrica, por um vendedor com acesso e em um nível de preço."
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
            <Button.Title>Vincular cliente</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
