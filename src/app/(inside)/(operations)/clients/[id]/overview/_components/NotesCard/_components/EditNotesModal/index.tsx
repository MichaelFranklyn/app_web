"use client";

import { Button } from "@/components/Button";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { Pencil } from "lucide-react";
import { useRef, useState } from "react";
import { UpdateClientNotesResponse } from "../../../../interface";
import { UPDATE_CLIENT_NOTES_MUTATION } from "./gql";
import { EditNotesModalProps } from "./interface";
import { buildNotesFormSteps, normalizeNotesInput } from "./utils";

export function EditNotesModal({
  companyClientId,
  companyClient,
  currentNotes,
  onSuccess,
  onUpdateOptimistic,
  onCommit,
  onRollback,
}: EditNotesModalProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const { execute, isLoading } = useAsyncAction();

  const [updateNotes] = useMutation<UpdateClientNotesResponse>(
    UPDATE_CLIENT_NOTES_MUTATION
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const normalized = normalizeNotesInput(data);

    setOpen(false);
    if (companyClient) {
      onUpdateOptimistic({
        companyClient: { ...companyClient, notes: normalized.notes },
      });
    }

    await execute(
      async () => {
        const res = await updateNotes({
          variables: { id: companyClientId, input: normalized },
        });

        if (!res.data?.updateClientNotes?.status) {
          throw new Error(
            res.data?.updateClientNotes?.message ?? "Erro ao atualizar notas"
          );
        }

        return res.data.updateClientNotes.data;
      },
      {
        successMessage: "Notas atualizadas com sucesso",
        onSuccess: () => {
          formRef.current?.resetForm();
          onCommit();
          onSuccess?.();
        },
        onError: () => {
          onRollback();
        },
      }
    );
  };

  const formSteps = buildNotesFormSteps();

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="ghost" color="neutral" size="xs" noUppercase>
          <Button.Icon icon={Pencil} />
          <Button.Title>Editar</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="sm">
        <Modal.Header
          title="Editar Notas Privadas"
          description="Atualize as anotações sobre este cliente"
        />

        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={formSteps}
            onSubmit={handleSubmit}
            loading={isLoading}
            initialData={{ notes: currentNotes }}
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
