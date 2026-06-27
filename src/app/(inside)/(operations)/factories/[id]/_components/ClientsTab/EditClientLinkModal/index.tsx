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
import { Pencil } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  FactoryClientLink,
  PRICE_TIERS_FOR_LINK_QUERY,
  TiersData,
} from "../gql";
import { PRIORITY_OPTIONS } from "../utils";
import { UPDATE_SELLER_CLIENT_FACTORY_MUTATION } from "./gql";
import { extractSelectValue } from "@/utils/form";

interface UpdateResponse {
  updateSellerClientFactory: {
    status: boolean;
    message: string;
    data: { id: string } | null;
  };
}

interface Props {
  link: FactoryClientLink;
  companyFactoryId: string;
  onUpdateOptimistic: (id: string, updates: Partial<FactoryClientLink>) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function EditClientLinkModal({
  link,
  companyFactoryId,
  onUpdateOptimistic,
  onCommit,
  onRollback,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const invalidateClient = useInvalidateQueriesClient();
  const { execute, isLoading } = useAsyncAction();

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
        id: "edit",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "priceTierId",
                type: "select-single",
                label: "Nível da tabela de preço",
                placeholder: "Selecione o nível",
                required: true,
                options: tierOptions,
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
    [tierOptions]
  );

  const initialData = useMemo(
    () => ({
      priceTierId: link.priceTier
        ? { value: link.priceTier.id, label: link.priceTier.name }
        : null,
      priority: link.priority
        ? {
            value: link.priority,
            label:
              PRIORITY_OPTIONS.find((o) => o.value === link.priority)?.label ??
              link.priority,
          }
        : null,
    }),
    [link]
  );

  const [updateLink] = useMutation<UpdateResponse>(
    UPDATE_SELLER_CLIENT_FACTORY_MUTATION
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const priceTierId = extractSelectValue(data.priceTierId);
    const priority = extractSelectValue(data.priority);
    if (!priceTierId) return;

    const input: Record<string, unknown> = { priceTierId };
    if (priority) input.priority = priority;

    const tierNode = tierOptions.find((o) => o.value === priceTierId);

    setOpen(false);
    onUpdateOptimistic(link.id, {
      priceTierId,
      priceTier: tierNode
        ? { id: tierNode.value, name: tierNode.label }
        : link.priceTier,
      priority: priority || link.priority,
    });

    await execute(
      async () => {
        const res = await updateLink({ variables: { id: link.id, input } });
        if (
          !res.data?.updateSellerClientFactory?.status ||
          !res.data.updateSellerClientFactory.data
        ) {
          throw new Error(
            res.data?.updateSellerClientFactory?.message ??
              "Erro ao atualizar vínculo"
          );
        }
        return res.data.updateSellerClientFactory.data;
      },
      {
        successMessage: "Vínculo atualizado com sucesso",
        onSuccess: async () => {
          onCommit();
          await invalidateClient(["sellerClientFactoryList"]);
        },
        onError: () => onRollback(),
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="ghost" color="neutral" size="xs" noUppercase>
          <Button.Icon icon={Pencil} />
          <Button.Title>Editar</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Editar vínculo"
          description="Altere o nível de preço e a prioridade deste cliente nesta fábrica."
        />

        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={formSteps}
            onSubmit={handleSubmit}
            loading={isLoading}
            initialData={initialData}
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
            <Button.Title>Salvar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
