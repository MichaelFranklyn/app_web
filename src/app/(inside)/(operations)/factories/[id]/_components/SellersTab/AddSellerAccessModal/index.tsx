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
  CREATE_SELLER_FACTORY_ACCESS_MUTATION,
  FACTORY_LINKED_ACCESSES_QUERY,
  FACTORY_SELLERS_OPTIONS_QUERY,
} from "./gql";
import {
  CreateAccessResponse,
  FactoryLinkedAccessesData,
  FactorySellersOptionsData,
} from "./interface";

interface Props {
  factoryId: string;
}

export function AddSellerAccessModal({ factoryId }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const invalidateClient = useInvalidateQueriesClient();

  const { data: sellersData } = useQuery<FactorySellersOptionsData>(
    FACTORY_SELLERS_OPTIONS_QUERY,
    { variables: { input: { first: 200 } }, skip: !open }
  );

  const { data: accessesData } = useQuery<FactoryLinkedAccessesData>(
    FACTORY_LINKED_ACCESSES_QUERY,
    {
      variables: {
        input: {
          first: 200,
          filters: [{ field: "factory_id", operator: "eq", value: factoryId }],
        },
      },
      skip: !open,
    }
  );

  const linkedSellerIds = useMemo(
    () =>
      new Set(
        accessesData?.factory_linked_accesses?.edges?.map(
          ({ node }) => node.sellerId
        ) ?? []
      ),
    [accessesData]
  );

  const sellerOptions = useMemo(
    () =>
      sellersData?.factory_sellers_options?.edges
        ?.filter(
          ({ node }) => node.isActive && !linkedSellerIds.has(node.id)
        )
        .map(({ node }) => ({ label: node.name, value: node.id })) ?? [],
    [sellersData, linkedSellerIds]
  );

  const formSteps = useMemo<FormStepSchema[]>(
    () => [
      {
        id: "access",
        sections: [
          {
            id: "seller",
            fields: [
              {
                name: "seller",
                type: "select-single",
                label: "Vendedor",
                placeholder:
                  sellerOptions.length === 0
                    ? "Nenhum vendedor disponível"
                    : "Selecione o vendedor",
                options: sellerOptions,
                required: true,
              },
            ],
          },
        ],
      },
    ],
    [sellerOptions]
  );

  const [createAccess] = useMutation<CreateAccessResponse>(
    CREATE_SELLER_FACTORY_ACCESS_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const sellerId = (data.seller as { value: string } | null)?.value;
    if (!sellerId) return;

    await execute(
      async () => {
        const res = await createAccess({
          variables: { input: { sellerId, factoryId } },
        });

        if (
          !res.data?.createSellerFactoryAccess?.status ||
          !res.data.createSellerFactoryAccess.data
        ) {
          throw new Error(
            res.data?.createSellerFactoryAccess?.message ??
              "Erro ao conceder acesso"
          );
        }

        return res.data.createSellerFactoryAccess.data;
      },
      {
        successMessage: "Acesso concedido com sucesso",
        onSuccess: async () => {
          setOpen(false);
          formRef.current?.resetForm();
          await invalidateClient([
            "factory_seller_accesses",
            "sellerFactoryAccessList",
          ]);
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="sm">
          <Button.Icon icon={Plus} />
          <Button.Title>Conceder acesso</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Conceder acesso de vendedor"
          description="Apenas vendedores ativos sem vínculo com esta fábrica aparecem."
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
            <Button.Title>Conceder acesso</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
