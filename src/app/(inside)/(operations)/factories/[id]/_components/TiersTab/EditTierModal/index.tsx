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
import { Pencil } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { UPDATE_PRICE_TIER_MUTATION } from "../gql";

interface UpdateTierResponse {
  updatePriceTier: {
    __typename?: "PriceTierTypeDataResponse";
    status: boolean;
    message: string;
    data: { __typename?: "PriceTierType"; id: string; name: string } | null;
  };
}

interface Props {
  tierId: string;
  tierName: string;
  onChanged: () => void;
  onUpdateOptimistic: (id: string, updates: { name: string }) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function EditTierModal({
  tierId,
  tierName,
  onChanged,
  onUpdateOptimistic,
  onCommit,
  onRollback,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const [updateTier] = useMutation<UpdateTierResponse>(
    UPDATE_PRICE_TIER_MUTATION
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

  const initialData = useMemo(() => ({ name: tierName }), [tierName]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    const name = String(data.name ?? "").trim();
    if (!name || name === tierName) {
      setOpen(false);
      return;
    }

    setOpen(false);
    onUpdateOptimistic(tierId, { name });

    await execute(
      async () => {
        const res = await updateTier({
          variables: { id: tierId, input: { name } },
        });
        if (!res.data?.updatePriceTier?.status || !res.data.updatePriceTier.data) {
          throw new Error(
            res.data?.updatePriceTier?.message ?? "Erro ao atualizar nível"
          );
        }
        return res.data.updatePriceTier.data;
      },
      {
        successMessage: "Nível atualizado com sucesso",
        onSuccess: () => {
          onCommit();
          onChanged();
        },
        onError: () => {
          onRollback();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="ghost" color="neutral" size="sm" isIconOnly>
          <Button.Icon icon={Pencil} />
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Editar nível"
          description={`Altere o nome do nível comercial "${tierName}".`}
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={steps}
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
