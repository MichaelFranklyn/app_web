"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { SelectOption } from "@/components/Input/InputSelect";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useMutation, useQuery } from "@apollo/client/react";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
  /** Abre o modal automaticamente ao montar (fluxo pós-criação da fábrica). */
  autoOpen?: boolean;
}

export function AddSellerAccessModal({ factoryId, autoOpen }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const invalidateClient = useInvalidateQueriesClient();
  const { toast } = useToast();

  useEffect(() => {
    if (autoOpen) setOpen(true);
  }, [autoOpen]);

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
        ?.filter(({ node }) => node.isActive && !linkedSellerIds.has(node.id))
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
                name: "sellers",
                type: "select-multi",
                label: "Vendedores",
                placeholder:
                  sellerOptions.length === 0
                    ? "Nenhum vendedor disponível"
                    : "Selecione um ou mais vendedores",
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
    const selected = Array.isArray(data.sellers)
      ? (data.sellers as SelectOption[])
      : [];
    const sellerIds = selected.map((opt) => opt.value).filter(Boolean);
    if (sellerIds.length === 0) {
      toast({
        variant: "error",
        title: "Erro",
        description: "Selecione ao menos um vendedor.",
      });
      return;
    }

    await execute(
      async () => {
        const results = await Promise.allSettled(
          sellerIds.map(async (sellerId) => {
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
          })
        );

        const successCount = results.filter(
          (r) => r.status === "fulfilled"
        ).length;
        const failCount = results.length - successCount;

        // Todos falharam → lança para o toast de erro do execute.
        if (successCount === 0) {
          const first = results.find(
            (r): r is PromiseRejectedResult => r.status === "rejected"
          );
          const reason = first?.reason;
          throw new Error(
            reason instanceof Error ? reason.message : "Erro ao conceder acesso"
          );
        }

        return { successCount, failCount };
      },
      {
        onSuccess: async ({ successCount, failCount }) => {
          setOpen(false);
          formRef.current?.resetForm();
          toast({
            variant: "success",
            title: "Sucesso",
            description: `${successCount} vendedor(es) vinculado(s) com sucesso`,
          });
          if (failCount > 0) {
            toast({
              variant: "error",
              title: "Atenção",
              description: `${failCount} vínculo(s) não puderam ser criados`,
            });
          }
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

      <Modal.Content size="lg">
        <Modal.Header
          title="Conceder acesso a vendedores"
          description="Selecione um ou mais vendedores. Apenas vendedores ativos sem vínculo com esta fábrica aparecem."
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
