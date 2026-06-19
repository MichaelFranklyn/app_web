"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";

import { DELETE_IMPORT_TEMPLATE_MUTATION } from "../gql";

interface Props {
  templateId: string;
  /** Substantivo do modelo (ex.: "modelo de pedido", "modelo de tabela de preço"). */
  label?: string;
  onRemoved: () => void;
}

interface DeleteResponse {
  deleteImportTemplate: { status: boolean; message: string };
}

export function RemoveTemplateModal({ templateId, label = "modelo de pedido", onRemoved }: Props) {
  const [open, setOpen] = useState(false);
  const [deleteTemplate] = useMutation<DeleteResponse>(DELETE_IMPORT_TEMPLATE_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    await execute(
      async () => {
        const res = await deleteTemplate({ variables: { id: templateId } });
        if (!res.data?.deleteImportTemplate?.status) {
          throw new Error(res.data?.deleteImportTemplate?.message ?? "Erro ao remover o modelo");
        }
        return res.data.deleteImportTemplate;
      },
      {
        successMessage: `${label.charAt(0).toUpperCase()}${label.slice(1)} removido`,
        onSuccess: () => {
          onRemoved();
          setOpen(false);
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="ghost" color="red" size="sm" noUppercase>
          <Button.Icon icon={Trash2} />
          <Button.Title>Remover</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="sm">
        <Modal.Header
          title={`Remover ${label}`}
          description="As próximas importações desta fábrica voltarão a pedir o mapeamento manual. Deseja continuar?"
        />
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root type="button" appearance="ghost" color="neutral" size="md" noUppercase disabled={isLoading}>
              <Button.Title>Voltar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="red"
            size="md"
            noUppercase
            loading={isLoading}
            onClick={handleConfirm}
          >
            <Button.Title>Remover modelo</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
