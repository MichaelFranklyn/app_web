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
import { onlyDigits } from "@/utils/format/masks";
import { useMutation } from "@apollo/client/react";
import { Pencil } from "lucide-react";
import { useRef, useState } from "react";
import { UPDATE_CLIENT_CONTACT_MUTATION } from "../../gql";
import {
  ClientContact,
  UpdateClientContactInput,
  UpdateClientContactResponse,
} from "../../interface";

const FORM_STEPS: FormStepSchema[] = [
  {
    id: "contact",
    sections: [
      {
        id: "contact",
        fields: [
          {
            name: "name",
            type: "text",
            label: "Nome",
            placeholder: "Nome do contato",
            required: true,
          },
          {
            name: "role",
            type: "text",
            label: "Cargo",
            placeholder: "Ex: Comprador",
          },
          {
            name: "phone",
            type: "phone",
            label: "Telefone",
            placeholder: "(00) 00000-0000",
          },
          {
            name: "email",
            type: "email",
            label: "E-mail",
            placeholder: "contato@empresa.com",
          },
          {
            name: "isPrimary",
            type: "switch",
            label: "Contato principal",
            options: [{ value: "true", label: "Marcar como principal" }],
          },
        ],
      },
    ],
  },
];

function buildInitialData(contact: ClientContact): Record<string, unknown> {
  return {
    name: contact.name,
    role: contact.role ?? "",
    phone: contact.phone ?? "",
    email: contact.email ?? "",
    isPrimary: contact.isPrimary ? ["true"] : [],
  };
}

function normalizeInput(data: Record<string, unknown>): UpdateClientContactInput {
  const phone = data.phone ? onlyDigits(String(data.phone)) : null;
  const isPrimary =
    Array.isArray(data.isPrimary) && data.isPrimary.includes("true");
  return {
    name: String(data.name ?? "").trim(),
    role: data.role ? String(data.role).trim() : null,
    phone: phone || null,
    email: data.email ? String(data.email).trim() : null,
    isPrimary,
  };
}

interface Props {
  clientId: string;
  contact: ClientContact;
  onUpdateOptimistic: (id: string, updates: Partial<ClientContact>) => void;
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
  const [updateContact] = useMutation<UpdateClientContactResponse>(
    UPDATE_CLIENT_CONTACT_MUTATION
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
        if (!res.data?.updateClientContact?.status) {
          throw new Error(
            res.data?.updateClientContact?.message ?? "Erro ao atualizar contato"
          );
        }
        return res.data.updateClientContact.data;
      },
      {
        successMessage: "Contato atualizado",
        onSuccess: async () => {
          onCommit();
          await invalidateClient(["clientContacts"]);
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
          aria-label="Editar contato"
        >
          <Button.Icon icon={Pencil} />
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Editar contato"
          description="Atualize os dados deste contato."
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={FORM_STEPS}
            onSubmit={handleSubmit}
            loading={isLoading}
            initialData={buildInitialData(contact)}
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
