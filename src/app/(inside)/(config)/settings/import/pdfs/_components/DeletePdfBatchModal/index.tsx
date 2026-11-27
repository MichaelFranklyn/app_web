"use client";

import { ConfirmModal } from "@/components/ConfirmModal";
import { useMutation } from "@apollo/client/react";

import { DELETE_ORDER_PDF_IMPORT_BATCH_MUTATION } from "../../gql";
import { DeletePdfImportBatchResponse, PdfImportBatch } from "../../interface";

interface Props {
  batch: PdfImportBatch;
  onDeleted: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Confirma a exclusão do lote. Os pedidos que já saíram dele ficam: são
 * histórico de vendas, e desfazer importação tem o caminho próprio.
 */
export function DeletePdfBatchModal({
  batch,
  onDeleted,
  open,
  onOpenChange,
}: Props) {
  const [deleteBatch] = useMutation<DeletePdfImportBatchResponse>(
    DELETE_ORDER_PDF_IMPORT_BATCH_MUTATION
  );
  const kept =
    batch.importedFiles === 0
      ? ""
      : batch.importedFiles === 1
        ? " O pedido já importado dele continua no histórico."
        : " Os pedidos já importados dele continuam no histórico.";

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Excluir lote"
      description={`O lote de ${batch.factoryName} e os PDFs enviados nele saem da lista.${kept}`}
      confirmLabel="Excluir"
      successMessage="Lote excluído"
      onConfirm={async () => {
        const res = await deleteBatch({ variables: { id: batch.id } });
        if (!res.data?.deleteOrderPdfImportBatch?.status) {
          throw new Error(
            res.data?.deleteOrderPdfImportBatch?.message ??
              "Não foi possível excluir o lote."
          );
        }
      }}
      onSuccess={onDeleted}
    />
  );
}
