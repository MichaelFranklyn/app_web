"use client";

import { Button } from "@/components/Button";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { FACTORY_CONTACT_CACHE_FIELDS } from "@/utils/cacheFields";
import { useMutation } from "@apollo/client/react";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";

import { CREATE_FACTORY_CONTACT_MUTATION } from "../../gql";
import {
  CreateFactoryContactInput,
  CreateFactoryContactResponse,
  FactoryContact,
} from "../../interface";
import {
  CONTACT_FORM_STEPS,
  readIsPrimary,
  readPhone,
} from "../ContactFormFields";

function normalizeInput(
  data: Record<string, unknown>,
  factoryId: string
): CreateFactoryContactInput {
  const phone = readPhone(data);
  return {
    factoryId,
    name: String(data.name ?? "").trim(),
    ...(data.role ? { role: String(data.role).trim() } : {}),
    ...(phone ? { phone } : {}),
    ...(data.email ? { email: String(data.email).trim() } : {}),
    isPrimary: readIsPrimary(data),
  };
}

interface Props {
  factoryId: string;
  onAddOptimistic: (contact: FactoryContact) => void;
}

export function AddContactModal({ factoryId, onAddOptimistic }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const { execute, isLoading } = useAsyncAction();
  const invalidateClient = useInvalidateQueriesClient();
  const [createContact] = useMutation<CreateFactoryContactResponse>(
    CREATE_FACTORY_CONTACT_MUTATION
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const input = normalizeInput(data, factoryId);
    if (!input.name) return;

    await execute(
      async () => {
        const res = await createContact({ variables: { input } });
        const payload = res.data?.createFactoryContact;
        if (!payload?.status || !payload.data) {
          throw new Error(payload?.message ?? "Erro ao criar contato");
        }
        return payload.data;
      },
      {
        successMessage: "Contato adicionado",
        onSuccess: async (contact) => {
          setOpen(false);
          formRef.current?.resetForm();
          onAddOptimistic(contact);
          // O envio do pedido lê a mesma lista para achar o WhatsApp.
          await invalidateClient(FACTORY_CONTACT_CACHE_FIELDS);
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="sm">
          <Button.Icon icon={Plus} />
          <Button.Title>Adicionar contato</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Adicionar contato"
          description="Quem atende na fábrica. O telefone é o número que recebe o pedido no WhatsApp."
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={CONTACT_FORM_STEPS}
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
            <Button.Title>Adicionar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
