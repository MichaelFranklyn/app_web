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
import { useMutation } from "@apollo/client/react";
import { Pencil } from "lucide-react";
import { useRef, useState } from "react";
import { ClientDetail } from "../../interface";
import { UPDATE_COMPANY_CLIENT_MUTATION } from "./gql";

interface UpdateCompanyClientResponse {
  updateCompanyClient: {
    status: boolean;
    message: string;
    data: { id: string; isActive: boolean } | null;
  };
}

const FORM_STEPS: FormStepSchema[] = [
  {
    id: "client",
    sections: [
      {
        id: "identity",
        title: "Identificação",
        fields: [
          {
            name: "razaoSocial",
            type: "text",
            label: "Razão social",
            disabled: true,
            hint: "Dado vindo da Receita Federal — não pode ser alterado.",
          },
          {
            name: "nomeFantasia",
            type: "text",
            label: "Nome fantasia",
            disabled: true,
            hint: "Dado vindo da Receita Federal — não pode ser alterado.",
          },
          {
            name: "isActive",
            type: "switch",
            label: "Situação na carteira",
            options: [{ value: "true", label: "Cliente ativo" }],
          },
        ],
      },
    ],
  },
];

interface Props {
  client: ClientDetail;
  onUpdateOptimistic: (updates: Partial<ClientDetail>) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function EditClientModal({
  client,
  onUpdateOptimistic,
  onCommit,
  onRollback,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const invalidateClient = useInvalidateQueriesClient();
  const [updateCompanyClient] = useMutation<UpdateCompanyClientResponse>(
    UPDATE_COMPANY_CLIENT_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const companyClient = client.companyClient;

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!companyClient) {
      setOpen(false);
      return;
    }

    const isActive =
      Array.isArray(data.isActive) && data.isActive.includes("true");

    if (isActive === companyClient.isActive) {
      setOpen(false);
      return;
    }

    setOpen(false);
    onUpdateOptimistic({
      companyClient: { ...companyClient, isActive },
    });

    await execute(
      async () => {
        const res = await updateCompanyClient({
          variables: { id: companyClient.id, input: { isActive } },
        });
        if (!res.data?.updateCompanyClient?.status) {
          throw new Error(
            res.data?.updateCompanyClient?.message ?? "Erro ao atualizar cliente"
          );
        }
        return res.data.updateCompanyClient.data;
      },
      {
        successMessage: "Cliente atualizado com sucesso",
        onSuccess: async () => {
          onCommit();
          await invalidateClient(["client"]);
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
        <Button.Root appearance="outline" color="neutral" size="sm" noUppercase>
          <Button.Icon icon={Pencil} />
          <Button.Title>Editar</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Editar cliente"
          description="Os dados da Receita Federal não podem ser editados. Aqui você define a situação do cliente na sua carteira."
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={FORM_STEPS}
            onSubmit={handleSubmit}
            loading={isLoading}
            initialData={{
              razaoSocial: client.razaoSocial,
              nomeFantasia: client.nomeFantasia ?? "",
              isActive: companyClient?.isActive ? ["true"] : [],
            }}
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
