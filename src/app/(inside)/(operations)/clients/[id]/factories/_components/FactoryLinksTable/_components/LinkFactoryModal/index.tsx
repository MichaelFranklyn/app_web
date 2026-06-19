"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation, useQuery } from "@apollo/client/react";
import { Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { CreateSellerClientFactoryResponse } from "../../../../interface";
import {
  COMPANY_FACTORIES_FOR_LINK_QUERY,
  CREATE_SELLER_CLIENT_FACTORY_MUTATION,
  PRICE_TIERS_FOR_LINK_QUERY,
  SELLERS_FOR_LINK_QUERY,
  SELLER_CLIENT_FACTORIES_FOR_LINK_QUERY,
  SELLER_FACTORY_ACCESSES_FOR_LINK_QUERY,
} from "./gql";
import { LinkFactoryModalProps } from "./interface";
import { PRIORITY_OPTIONS, normalizeLinkFactoryInput } from "./utils";

interface SellersData {
  sellers: {
    edges: { node: { id: string; name: string; isActive: boolean } }[];
  };
}

interface AccessesData {
  sellerFactoryAccessList: {
    edges: {
      node: {
        id: string;
        sellerId: string;
        factoryId: string;
        isActive: boolean;
        factory: {
          id: string;
          nomeFantasia: string | null;
          razaoSocial: string;
        } | null;
      };
    }[];
  };
}

interface ClientLinksData {
  sellerClientFactoryList: {
    edges: { node: { id: string; sellerId: string; factoryId: string } }[];
  };
}

interface CompanyFactoriesData {
  companyFactories: {
    edges: { node: { id: string; factoryId: string } }[];
  };
}

interface PriceTiersData {
  priceTiers: {
    edges: { node: { id: string; name: string } }[];
  };
}

const LIST_INPUT = { first: 200 };

export function LinkFactoryModal({
  clientId,
  onSuccess,
}: LinkFactoryModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [selectedFactoryId, setSelectedFactoryId] = useState<string | null>(
    null
  );
  const formRef = useRef<FormBuilderRef>(null);
  const { execute, isLoading } = useAsyncAction();

  const { data: sellersData } = useQuery<SellersData>(SELLERS_FOR_LINK_QUERY, {
    variables: { input: LIST_INPUT },
    skip: !open,
  });

  const { data: accessesData } = useQuery<AccessesData>(
    SELLER_FACTORY_ACCESSES_FOR_LINK_QUERY,
    { variables: { input: LIST_INPUT }, skip: !open }
  );

  const { data: clientLinksData } = useQuery<ClientLinksData>(
    SELLER_CLIENT_FACTORIES_FOR_LINK_QUERY,
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

  const { data: companyFactoriesData } = useQuery<CompanyFactoriesData>(
    COMPANY_FACTORIES_FOR_LINK_QUERY,
    { variables: { input: LIST_INPUT }, skip: !open }
  );

  // O company_factory da fábrica selecionada; é dele que pendem os níveis de preço.
  const companyFactoryId = useMemo(
    () =>
      companyFactoriesData?.companyFactories.edges.find(
        ({ node }) => node.factoryId === selectedFactoryId
      )?.node.id ?? null,
    [companyFactoriesData, selectedFactoryId]
  );

  const { data: tiersData } = useQuery<PriceTiersData>(
    PRICE_TIERS_FOR_LINK_QUERY,
    {
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
      skip: !open || !companyFactoryId,
    }
  );

  const tierOptions = useMemo(
    () =>
      tiersData?.priceTiers.edges.map(({ node }) => ({
        label: node.name,
        value: node.id,
      })) ?? [],
    [tiersData]
  );

  const sellerOptions = useMemo(
    () =>
      sellersData?.sellers?.edges
        ?.filter(({ node }) => node.isActive)
        .map(({ node }) => ({ label: node.name, value: node.id })) ?? [],
    [sellersData]
  );

  const factoryOptions = useMemo(() => {
    if (!selectedSellerId || !accessesData) return [];

    const existingLinks = new Set(
      (clientLinksData?.sellerClientFactoryList?.edges ?? [])
        .filter(({ node }) => node.sellerId === selectedSellerId)
        .map(({ node }) => node.factoryId)
    );

    return accessesData.sellerFactoryAccessList.edges
      .filter(
        ({ node }) =>
          node.sellerId === selectedSellerId &&
          node.isActive &&
          node.factory &&
          !existingLinks.has(node.factoryId)
      )
      .map(({ node }) => ({
        label: node.factory!.nomeFantasia ?? node.factory!.razaoSocial,
        value: node.factoryId,
      }));
  }, [selectedSellerId, accessesData, clientLinksData]);

  const formSteps = useMemo<FormStepSchema[]>(
    () => [
      {
        id: "link",
        sections: [
          {
            id: "assignment",
            title: "Vínculo do cliente",
            fields: [
              {
                name: "sellerId",
                type: "select-single",
                label: "Vendedor",
                placeholder: "Selecione um vendedor",
                required: true,
                options: sellerOptions,
                onChange: (value, setValue) => {
                  const selected = value as { value: string } | null;
                  setSelectedSellerId(selected?.value ?? null);
                  setValue("factoryId", null);
                },
              },
              {
                name: "factoryId",
                type: "select-single",
                label: "Fábrica",
                placeholder: selectedSellerId
                  ? factoryOptions.length === 0
                    ? "Vendedor sem fábricas disponíveis"
                    : "Selecione uma fábrica"
                  : "Selecione um vendedor primeiro",
                required: true,
                options: factoryOptions,
                onChange: (value, setValue) => {
                  const selected = value as { value: string } | null;
                  setSelectedFactoryId(selected?.value ?? null);
                  setValue("priceTierId", null);
                },
              },
              {
                name: "priceTierId",
                type: "select-single",
                label: "Nível da tabela de preço",
                placeholder: !selectedFactoryId
                  ? "Selecione uma fábrica primeiro"
                  : tierOptions.length === 0
                    ? "Fábrica sem níveis cadastrados"
                    : "Selecione o nível do cliente",
                required: true,
                options: tierOptions,
                hint: "Nível de preço acordado para este cliente nesta fábrica. A importação de pedidos usa este nível como referência para conferir o preço.",
              },
              {
                name: "priority",
                type: "select-single",
                label: "Prioridade",
                placeholder: "Selecione a prioridade",
                options: PRIORITY_OPTIONS,
              },
              {
                name: "visitFrequencyDays",
                type: "number",
                label: "Frequência de visita (dias)",
                placeholder: "Ex: 7",
              },
            ],
          },
        ],
      },
    ],
    [sellerOptions, factoryOptions, selectedSellerId, selectedFactoryId, tierOptions]
  );

  const [linkFactory] = useMutation<CreateSellerClientFactoryResponse>(
    CREATE_SELLER_CLIENT_FACTORY_MUTATION
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const normalized = normalizeLinkFactoryInput(data, clientId);

    await execute(
      async () => {
        const res = await linkFactory({
          variables: { input: normalized },
        });

        if (!res.data?.createSellerClientFactory?.status) {
          throw new Error(
            res.data?.createSellerClientFactory?.message ?? "Erro ao vincular"
          );
        }

        return res.data.createSellerClientFactory.data;
      },
      {
        successMessage: "Vínculo criado com sucesso",
        onSuccess: () => {
          setOpen(false);
          setSelectedSellerId(null);
          setSelectedFactoryId(null);
          formRef.current?.resetForm();
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Modal.Root
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setSelectedSellerId(null);
          setSelectedFactoryId(null);
        }
      }}
    >
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="xs" noUppercase>
          <Button.Icon icon={Plus} />
          <Button.Title>Vincular</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Vincular fábrica ao cliente"
          description="Apenas fábricas que o vendedor selecionado possui acesso aparecerão."
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
            <Button.Title>Vincular</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
