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

import { CREATE_CLIENT_NETWORK_MUTATION } from "../../../gql";
import { ClientNetwork, CreateClientNetworkResponse } from "../../../interface";

interface Props {
  onAddOptimistic: (network: ClientNetwork) => void;
  onChanged: () => void;
}

export function AddNetworkModal({ onAddOptimistic, onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const [createNetwork] = useMutation<CreateClientNetworkResponse>(
    CREATE_CLIENT_NETWORK_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "network",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "name",
                type: "text",
                label: "Nome da rede",
                required: true,
                placeholder: "Ex: Rede Bom Preço",
                hint: "Depois de criar a rede, abra cada loja na carteira e escolha esta rede na ficha dela.",
              },
              {
                name: "notes",
                type: "textarea",
                label: "Observações (opcional)",
                placeholder:
                  "Contato da matriz, condição negociada, o que precisar lembrar.",
                rows: 3,
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
    const name = String(data.name ?? "").trim();
    const notes = String(data.notes ?? "").trim();

    await execute(
      async () => {
        const res = await createNetwork({
          variables: { input: { name, notes: notes || null } },
        });
        if (
          !res.data?.createClientNetwork?.status ||
          !res.data.createClientNetwork.data
        ) {
          throw new Error(
            res.data?.createClientNetwork?.message ?? "Erro ao criar rede"
          );
        }
        return res.data.createClientNetwork.data;
      },
      {
        successMessage: "Rede criada",
        onSuccess: (created) => {
          handleClose(false);
          onAddOptimistic(created);
          onChanged();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="sm">
          <Button.Icon icon={Plus} />
          <Button.Title>Nova rede</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Nova rede"
          description="Reúna as lojas do mesmo grupo para acompanhar a rede inteira de uma vez."
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
            <Button.Title>Criar rede</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
