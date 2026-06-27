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
import {
  SellerClientFactory,
  UpdateSellerClientFactoryResponse,
} from "../../../../../interface";
import { PRIORITY_OPTIONS } from "../../utils";
import { factoryName } from "@/utils/company";
import { UPDATE_SELLER_CLIENT_FACTORY_MUTATION } from "./gql";

interface UpdateInput {
  priority?: string;
  visitFrequencyDays?: number;
}

function normalizeInput(data: Record<string, unknown>): UpdateInput {
  const priorityRaw = data.priority as { value: string } | string | null;
  const priority =
    typeof priorityRaw === "object" && priorityRaw !== null
      ? priorityRaw.value
      : priorityRaw
        ? String(priorityRaw)
        : undefined;
  const freq = Number(data.visitFrequencyDays);

  return {
    ...(priority ? { priority } : {}),
    ...(!Number.isNaN(freq) && freq > 0 ? { visitFrequencyDays: freq } : {}),
  };
}

interface Props {
  link: SellerClientFactory;
  onSaved: () => void;
  onUpdateOptimistic: (
    id: string,
    updates: Partial<SellerClientFactory>
  ) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function EditFactoryLinkModal({
  link,
  onSaved,
  onUpdateOptimistic,
  onCommit,
  onRollback,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const { execute, isLoading } = useAsyncAction();
  const [updateLink] = useMutation<UpdateSellerClientFactoryResponse>(
    UPDATE_SELLER_CLIENT_FACTORY_MUTATION
  );

  const formSteps = useMemo<FormStepSchema[]>(
    () => [
      {
        id: "link",
        sections: [
          {
            id: "edit",
            fields: [
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
    []
  );

  const initialData = useMemo<Record<string, unknown>>(
    () => ({
      priority: link.priority
        ? (PRIORITY_OPTIONS.find((o) => o.value === link.priority) ?? null)
        : null,
      visitFrequencyDays: link.visitFrequencyDays ?? "",
    }),
    [link]
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const input = normalizeInput(data);

    setOpen(false);
    onUpdateOptimistic(link.id, input);

    await execute(
      async () => {
        const res = await updateLink({ variables: { id: link.id, input } });
        if (!res.data?.updateSellerClientFactory?.status) {
          throw new Error(
            res.data?.updateSellerClientFactory?.message ??
              "Erro ao atualizar vínculo"
          );
        }
        return res.data.updateSellerClientFactory.data;
      },
      {
        successMessage: "Vínculo atualizado",
        onSuccess: () => {
          onCommit();
          onSaved();
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
        <Button.Root
          appearance="ghost"
          color="neutral"
          size="xs"
          aria-label="Editar vínculo"
        >
          <Button.Icon icon={Pencil} />
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Editar vínculo"
          description={`Atualize as condições do vínculo com "${factoryName(link.factory)}".`}
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
