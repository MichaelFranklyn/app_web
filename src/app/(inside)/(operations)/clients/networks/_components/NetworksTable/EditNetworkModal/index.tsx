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

import { UPDATE_CLIENT_NETWORK_MUTATION } from "../../../gql";
import { ClientNetwork, UpdateClientNetworkResponse } from "../../../interface";

interface Props {
  network: ClientNetwork;
  onUpdateOptimistic: (id: string, updates: Partial<ClientNetwork>) => void;
  onCommit: () => void;
  onRollback: () => void;
  onChanged: () => void;
}

export function EditNetworkModal({
  network,
  onUpdateOptimistic,
  onCommit,
  onRollback,
  onChanged,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const [updateNetwork] = useMutation<UpdateClientNetworkResponse>(
    UPDATE_CLIENT_NETWORK_MUTATION
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

  const initialData = useMemo(
    () => ({ name: network.name, notes: network.notes ?? "" }),
    [network]
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const name = String(data.name ?? "").trim();
    const notes = String(data.notes ?? "").trim();

    if (!name) return;
    if (name === network.name && notes === (network.notes ?? "")) {
      setOpen(false);
      return;
    }

    setOpen(false);
    onUpdateOptimistic(network.id, { name, notes: notes || null });

    await execute(
      async () => {
        const res = await updateNetwork({
          variables: { id: network.id, input: { name, notes: notes || null } },
        });
        if (!res.data?.updateClientNetwork?.status) {
          throw new Error(
            res.data?.updateClientNetwork?.message ?? "Erro ao atualizar rede"
          );
        }
        return res.data.updateClientNetwork;
      },
      {
        successMessage: "Rede atualizada",
        onSuccess: () => {
          onCommit();
          onChanged();
        },
        onError: onRollback,
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
          label="Editar rede"
        >
          <Button.Icon icon={Pencil} />
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Editar rede"
          description={`Altere os dados da rede "${network.name}".`}
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
