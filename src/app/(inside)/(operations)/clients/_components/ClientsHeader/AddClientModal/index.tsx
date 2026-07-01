"use client";

import { Button } from "@/components/Button";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { invalidateCacheMany } from "@/services/graphql/actions";
import { useMutation } from "@apollo/client/react";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { ADD_CLIENT_TO_COMPANY_MUTATION } from "./gql";
import { AddClientToCompanyResponse } from "./interface";
import { FORM_STEPS, normalizeInput } from "./utils";

export function AddClientModal() {
  const [open, setOpen] = useState(false);
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
        onSuccess: async () => {
          setOpen(false);
          formRef.current?.resetForm();
          await invalidateClient(["clients_list"]);
          await invalidateCacheMany(["clients_stats"]);
        },
      }
    );
  };

  return (
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
  );
}
