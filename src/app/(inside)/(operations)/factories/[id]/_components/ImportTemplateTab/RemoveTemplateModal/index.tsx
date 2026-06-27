"use client";

import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";

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

export function RemoveTemplateModal({
  templateId,
  label = "modelo de pedido",
  onRemoved,
}: Props) {
  const [deleteTemplate] = useMutation<DeleteResponse>(
    DELETE_IMPORT_TEMPLATE_MUTATION
  );

  return (
    <ConfirmModal
      trigger={
        <Button.Root appearance="ghost" color="red" size="sm" noUppercase>
          <Button.Icon icon={Trash2} />
          <Button.Title>Remover</Button.Title>
        </Button.Root>
      }
      size="sm"
      title={`Remover ${label}`}
      description="As próximas importações desta fábrica voltarão a pedir o mapeamento manual. Deseja continuar?"
      confirmLabel="Remover modelo"
      cancelLabel="Voltar"
      successMessage={`${label.charAt(0).toUpperCase()}${label.slice(1)} removido`}
      onConfirm={async () => {
        const res = await deleteTemplate({ variables: { id: templateId } });
        if (!res.data?.deleteImportTemplate?.status) {
          throw new Error(
            res.data?.deleteImportTemplate?.message ??
              "Erro ao remover o modelo"
          );
        }
      }}
      onSuccess={onRemoved}
    />
  );
}
