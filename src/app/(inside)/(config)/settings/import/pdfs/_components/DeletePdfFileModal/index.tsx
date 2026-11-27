"use client";

import { ConfirmModal } from "@/components/ConfirmModal";
import { useMutation } from "@apollo/client/react";

import {
  DELETE_ORDER_PDF_IMPORT_FILE_MUTATION,
  ORDER_PDF_IMPORT_BATCH_QUERY,
  ORDER_PDF_IMPORT_BATCHES_QUERY,
} from "../../gql";
import { DeletePdfImportFileResponse, PdfImportFile } from "../../interface";

interface Props {
  batchId: string;
  file: PdfImportFile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Confirma a saída de um PDF do lote. Nada dele foi gravado como pedido;
 * enviar o mesmo arquivo de novo depois o traz de volta.
 */
export function DeletePdfFileModal({
  batchId,
  file,
  open,
  onOpenChange,
}: Props) {
  const [deleteFile] = useMutation<DeletePdfImportFileResponse>(
    DELETE_ORDER_PDF_IMPORT_FILE_MUTATION,
    {
      refetchQueries: [
        ORDER_PDF_IMPORT_BATCH_QUERY,
        ORDER_PDF_IMPORT_BATCHES_QUERY,
      ],
      awaitRefetchQueries: true,
    }
  );

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Excluir PDF do lote"
      description={`${file.fileName} sai do lote e não vira pedido. Para trazê-lo de volta, envie o arquivo de novo.`}
      confirmLabel="Excluir"
      successMessage="PDF excluído do lote"
      onConfirm={async () => {
        const res = await deleteFile({
          variables: { batchId, fileId: file.id },
        });
        if (!res.data?.deleteOrderPdfImportFile?.status) {
          throw new Error(
            res.data?.deleteOrderPdfImportFile?.message ??
              "Não foi possível excluir o PDF."
          );
        }
      }}
    />
  );
}
