"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { CREATE_PRICE_TIER_MUTATION } from "../gql";

interface CreateTierResponse {
  createPriceTier: {
    __typename?: "PriceTierTypeDataResponse";
    status: boolean;
    message: string;
    data: { __typename?: "PriceTierType"; id: string; name: string } | null;
  };
}

interface Props {
  companyFactoryId: string;
  onAdded: () => void;
  onAddOptimistic: (tier: { id: string; name: string }) => void;
}

export function AddTierModal({
  companyFactoryId,
  onAdded,
  onAddOptimistic,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const [createTier] = useMutation<CreateTierResponse>(
    CREATE_PRICE_TIER_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "tier",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "name",
                type: "text",
                label: "Nome do nível",
                required: true,
                placeholder: "Ex: Varejo, Atacado, Distribuidor",
              },
            ],
          },
        ],
      },
    ],
    []
  );

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) formRef.current?.resetForm();
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    await execute(
      async () => {
        const name = String(data.name ?? "").trim();
        const res = await createTier({
          variables: { input: { companyFactoryId, name } },
        });
        if (!res.data?.createPriceTier?.status || !res.data.createPriceTier.data) {
          throw new Error(
            res.data?.createPriceTier?.message ?? "Erro ao criar nível comercial"
          );
        }
        return res.data.createPriceTier.data;
      },
      {
        successMessage: "Nível comercial criado com sucesso",
        onSuccess: async (created) => {
          handleClose(false);
          onAddOptimistic({ id: created.id, name: created.name });
          onAdded();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="sm">
          <Button.Icon icon={Plus} />
          <Button.Title>Novo nível</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Novo nível comercial"
          description="Níveis (tiers) representam classes de cliente com preços diferentes — ex: varejo, atacado."
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={steps}
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
            <Button.Title>Criar nível</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
