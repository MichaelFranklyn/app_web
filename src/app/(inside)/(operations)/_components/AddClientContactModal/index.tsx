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
import { Plus } from "lucide-react";
import { ReactNode, useMemo, useRef, useState } from "react";
import { CREATE_CLIENT_CONTACT_MUTATION } from "./gql";
import {
  CreateClientContactInput,
  CreateClientContactResponse,
  NewClientContact,
} from "./interface";

const buildFormSteps = (phoneRequired: boolean): FormStepSchema[] => [
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
            required: phoneRequired,
            hint: phoneRequired
              ? "Celular com DDD — é por ele que sai a ligação e o WhatsApp."
              : undefined,
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

function normalizeInput(
  data: Record<string, unknown>,
  clientId: string
): CreateClientContactInput {
  const phone = data.phone ? onlyDigits(String(data.phone)) : undefined;
  const isPrimary =
    Array.isArray(data.isPrimary) && data.isPrimary.includes("true");
  return {
    clientId,
    name: String(data.name ?? "").trim(),
    ...(data.role ? { role: String(data.role).trim() } : {}),
    ...(phone ? { phone } : {}),
    ...(data.email ? { email: String(data.email).trim() } : {}),
    isPrimary,
  };
}

interface Props {
  /** Id GLOBAL do cliente (`clients.id`), não o da carteira. */
  clientId: string;
  onAdded: (contact: NewClientContact) => void | Promise<void>;
  /** Botão que abre o modal. Padrão: "Adicionar" âmbar, o da ficha do cliente. */
  trigger?: ReactNode;
  /**
   * Telefone obrigatório — quando o contato está sendo cadastrado PARA ligar
   * (card da ligação na rotina). Na ficha do cliente ele é opcional.
   */
  phoneRequired?: boolean;
}

/**
 * Cadastro de um contato do cliente. Compartilhado pela ficha do cliente e pela
 * rotina: o card de ligação sem telefone abre este mesmo modal, para o
 * vendedor não precisar sair da rotina, achar o cliente e voltar.
 */
export function AddClientContactModal({
  clientId,
  onAdded,
  trigger,
  phoneRequired = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const formSteps = useMemo(
    () => buildFormSteps(phoneRequired),
    [phoneRequired]
  );
  const formRef = useRef<FormBuilderRef>(null);
  const { execute, isLoading } = useAsyncAction();
  const invalidateClient = useInvalidateQueriesClient();
  const [createContact] = useMutation<CreateClientContactResponse>(
    CREATE_CLIENT_CONTACT_MUTATION
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const input = normalizeInput(data, clientId);

    if (!input.name) return;

    await execute(
      async () => {
        const res = await createContact({ variables: { input } });
        if (
          !res.data?.createClientContact?.status ||
          !res.data.createClientContact.data
        ) {
          throw new Error(
            res.data?.createClientContact?.message ?? "Erro ao criar contato"
          );
        }
        return res.data.createClientContact.data;
      },
      {
        successMessage: "Contato adicionado",
        onSuccess: async (newContact) => {
          setOpen(false);
          formRef.current?.resetForm();
          await onAdded(newContact);
          await invalidateClient(["clientContacts"]);
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        {trigger ?? (
          <Button.Root appearance="solid" color="amber" size="sm" noUppercase>
            <Button.Icon icon={Plus} />
            <Button.Title>Adicionar</Button.Title>
          </Button.Root>
        )}
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Adicionar contato"
          description="Registre um novo contato deste cliente."
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
            <Button.Title>Adicionar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
