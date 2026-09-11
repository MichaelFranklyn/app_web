"use client";

import { Button } from "@/components/Button";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { FACTORY_CONTACT_CACHE_FIELDS } from "@/utils/cacheFields";
import { useMutation } from "@apollo/client/react";
import { Pencil } from "lucide-react";
import { useRef, useState } from "react";

import { UPDATE_FACTORY_CONTACT_MUTATION } from "../../gql";
import {
  FactoryContact,
  UpdateFactoryContactInput,
  UpdateFactoryContactResponse,
} from "../../interface";
import {
  buildContactInitialData,
  CONTACT_FORM_STEPS,
  readIsPrimary,
  readPhone,
} from "../ContactFormFields";

function normalizeInput(
  data: Record<string, unknown>
): UpdateFactoryContactInput {
  return {
    name: String(data.name ?? "").trim(),
    // Campo esvaziado = apagar o dado; por isso null em vez de omitir.
    role: data.role ? String(data.role).trim() : null,
    phone: readPhone(data) || null,
    email: data.email ? String(data.email).trim() : null,
    isPrimary: readIsPrimary(data),
  };
}

interface Props {
  contact: FactoryContact;
  onUpdateOptimistic: (id: string, updates: Partial<FactoryContact>) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function EditContactModal({
  contact,
  onUpdateOptimistic,
  onCommit,
  onRollback,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const { execute, isLoading } = useAsyncAction();
  const invalidateClient = useInvalidateQueriesClient();
  const [updateContact] = useMutation<UpdateFactoryContactResponse>(
    UPDATE_FACTORY_CONTACT_MUTATION
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const input = normalizeInput(data);
    if (!input.name) return;

    setOpen(false);
    onUpdateOptimistic(contact.id, input);

    await execute(
      async () => {
        const res = await updateContact({
          variables: { id: contact.id, input },
        });
        const payload = res.data?.updateFactoryContact;
        if (!payload?.status) {
          throw new Error(payload?.message ?? "Erro ao atualizar contato");
        }
        return payload.data;
      },
      {
        successMessage: "Contato atualizado",
        onSuccess: async () => {
          onCommit();
          await invalidateClient(FACTORY_CONTACT_CACHE_FIELDS);
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
          size="sm"
          isIconOnly
          label="Editar contato"
        >
          <Button.Icon icon={Pencil} />
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Editar contato"
          description={`Atualize os dados de ${contact.name}.`}
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={CONTACT_FORM_STEPS}
            onSubmit={handleSubmit}
            loading={isLoading}
            initialData={buildContactInitialData(contact)}
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
