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
import {
  COMPANY_FACTORIES_OPTIONS_QUERY,
  CREATE_SELLER_FACTORY_ACCESS_MUTATION,
  SELLER_ACCESSES_QUERY,
  SELLERS_OPTIONS_QUERY,
} from "./gql";
import {
  CompanyFactoriesOptionsData,
  CreateAccessResponse,
  SellerAccessesData,
  SellersOptionsData,
} from "./interface";

const LIST_INPUT = { first: 200 };

export function AddAccessModal() {
  const [open, setOpen] = useState(false);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const formRef = useRef<FormBuilderRef>(null);
  const invalidateClient = useInvalidateQueriesClient();

  const { data: sellersData } = useQuery<SellersOptionsData>(
    SELLERS_OPTIONS_QUERY,
    {
      variables: { input: LIST_INPUT },
      skip: !open,
    }
  );

  const { data: factoriesData } = useQuery<CompanyFactoriesOptionsData>(
    COMPANY_FACTORIES_OPTIONS_QUERY,
    { variables: { input: LIST_INPUT }, skip: !open }
  );

  const { data: accessesData } = useQuery<SellerAccessesData>(
    SELLER_ACCESSES_QUERY,
    {
      variables: { input: LIST_INPUT },
      skip: !open,
    }
  );

  // Apenas vendedores ativos
  const sellerOptions = useMemo(
    () =>
      sellersData?.sellers_options?.edges
        ?.filter(({ node }) => node.isActive)
        .map(({ node }) => ({ label: node.name, value: node.id })) ?? [],
    [sellersData]
  );

  // Factories já vinculadas (ativas ou inativas) ao vendedor selecionado
  const linkedFactoryIds = useMemo(() => {
    if (!selectedSellerId || !accessesData) return new Set<string>();
    return new Set(
      accessesData.seller_accesses.edges
        .filter(({ node }) => node.sellerId === selectedSellerId)
        .map(({ node }) => node.factoryId)
    );
  }, [selectedSellerId, accessesData]);

  const factoryOptions = useMemo(
    () =>
      factoriesData?.company_factories_options?.edges
        ?.filter(
          ({ node }) =>
            node.factory !== null && !linkedFactoryIds.has(node.factoryId)
        )
        .map(({ node }) => ({
          label: node.factory!.nomeFantasia ?? node.factory!.razaoSocial,
          value: node.factoryId,
        })) ?? [],
    [factoriesData, linkedFactoryIds]
  );

  const formSteps = useMemo<FormStepSchema[]>(
    () => [
      {
        id: "access",
        sections: [
          {
            id: "link",
            title: "Vínculo",
            fields: [
              {
                name: "seller",
                type: "select-single",
                label: "Vendedor",
                placeholder: "Selecione o vendedor",
                options: sellerOptions,
                required: true,
                onChange: (value, setValue) => {
                  const selected = value as { value: string } | null;
                  setSelectedSellerId(selected?.value ?? null);
                  setValue("factory", null);
                },
              },
              {
                name: "factory",
                type: "select-single",
                label: "Fábrica",
                placeholder: selectedSellerId
                  ? factoryOptions.length === 0
                    ? "Nenhuma fábrica disponível"
                    : "Selecione a fábrica"
                  : "Selecione um vendedor primeiro",
                options: factoryOptions,
                required: true,
              },
            ],
          },
        ],
      },
    ],
    [sellerOptions, factoryOptions, selectedSellerId]
  );

  const [createAccess] = useMutation<CreateAccessResponse>(
    CREATE_SELLER_FACTORY_ACCESS_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const sellerId = (data.seller as { value: string } | null)?.value;
    const factoryId = (data.factory as { value: string } | null)?.value;

    await execute(
      async () => {
        const res = await createAccess({
          variables: { input: { sellerId, factoryId } },
        });

        if (!res.data?.createSellerFactoryAccess?.status) {
          throw new Error(
            res.data?.createSellerFactoryAccess?.message ??
              "Erro ao criar vínculo"
          );
        }

        return res.data.createSellerFactoryAccess;
      },
      {
        successMessage: "Vínculo criado com sucesso",
        onSuccess: async () => {
          setOpen(false);
          setSelectedSellerId(null);
          formRef.current?.resetForm();
          await invalidateClient(["seller_factory_access_list"]);
        },
      }
    );
  };

  return (
    <Modal.Root
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setSelectedSellerId(null);
      }}
    >
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="md">
          <Button.Icon icon={Plus} />
          <Button.Title>Novo Vínculo</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Vincular vendedor à fábrica"
          description="Apenas vendedores ativos são exibidos. Fábricas já vinculadas ao vendedor selecionado são ocultadas."
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
            <Button.Title>Criar vínculo</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
