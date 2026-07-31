"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { invalidateCacheMany } from "@/services/graphql/actions";
import { useMutation } from "@apollo/client/react";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { Client } from "../../../interface";
import { ADD_CLIENT_TO_COMPANY_MUTATION } from "./gql";
import { AddClientToCompanyResponse } from "./interface";
import { FORM_STEPS, normalizeInput } from "./utils";

interface AddClientModalProps {
  onAddOptimistic: (client: Client) => void;
}

export function AddClientModal({ onAddOptimistic }: AddClientModalProps) {
  const [open, setOpen] = useState(false);
  // company_client id recém-criado; dispara a pergunta de vínculo com fábrica.
  const [createdCompanyClientId, setCreatedCompanyClientId] = useState<
    string | null
  >(null);
  const formRef = useRef<FormBuilderRef>(null);
  const invalidateClient = useInvalidateQueriesClient();

  const [addClientToCompany] = useMutation<AddClientToCompanyResponse>(
    ADD_CLIENT_TO_COMPANY_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const normalized = normalizeInput(data);

    await execute(
      async () => {
        const res = await addClientToCompany({
          variables: { input: normalized },
        });

        if (
          !res.data?.addClientToCompany?.status ||
          !res.data.addClientToCompany.data
        ) {
          throw new Error(
            res.data?.addClientToCompany?.message ?? "Erro ao adicionar cliente"
          );
        }

        return res.data.addClientToCompany.data;
      },
      {
        successMessage: "Cliente adicionado à carteira com sucesso",
        onSuccess: async (created) => {
          setOpen(false);
          formRef.current?.resetForm();
          onAddOptimistic({
            ...created.client,
            // Cliente recém-adicionado ainda não tem vendedor, compra nem visita:
            // a linha otimista já entra com as colunas vazias que o refetch confirma.
            companyClient: {
              id: created.id,
              visitScoreTotal: null,
              lastOrderDate: null,
              lastInvoiceDate: null,
              lastVisitDate: null,
              sellers: [],
            },
          });
          await invalidateClient(["clients_list"]);
          await invalidateCacheMany(["clients_stats"]);
          setCreatedCompanyClientId(created.id);
        },
      }
    );
  };

  return (
    <>
      <Modal.Root open={open} onOpenChange={setOpen}>
        <Modal.Trigger asChild>
          <Button.Root appearance="solid" color="amber" size="sm">
            <Button.Icon icon={Plus} />
            <Button.Title>Novo Cliente</Button.Title>
          </Button.Root>
        </Modal.Trigger>

        <Modal.Content size="md">
          <Modal.Header
            title="Adicionar cliente"
            description="Informe o CNPJ. Os demais dados são preenchidos automaticamente via Receita Federal."
          />

          <Modal.Body>
            <FormBuilder
              ref={formRef}
              steps={FORM_STEPS}
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
              <Button.Title>Adicionar cliente</Button.Title>
            </Button.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>

      <ConfirmModal
        open={createdCompanyClientId !== null}
        onOpenChange={(v) => {
          if (!v) setCreatedCompanyClientId(null);
        }}
        title="Cliente adicionado!"
        description="Deseja vincular este cliente a uma fábrica agora?"
        confirmLabel="Vincular agora"
        cancelLabel="Agora não"
        confirmColor="amber"
        redirectTo={
          createdCompanyClientId
            ? `/clients/${createdCompanyClientId}/factories?link=1`
            : undefined
        }
        onConfirm={async () => {}}
      />
    </>
  );
}
