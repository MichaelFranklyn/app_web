"use client";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { fileToBase64 } from "@/utils/file";
import { useMutation } from "@apollo/client/react";
import { useState } from "react";

import {
  INVOICE_ORDERS_FROM_NFE_MUTATION,
  PREVIEW_NFE_IMPORT_MUTATION,
} from "./gql";
import {
  InvoiceOrdersFromNfeResponse,
  NfeFile,
  NfePreviewRow,
  PreviewNfeImportResponse,
} from "./interface";
import { isInvoiceable } from "./utils";

interface Args {
  onInvoiced: () => void;
}

/**
 * Os dois passos da importação: ler os arquivos e pedir a prévia; faturar as
 * notas marcadas. O conteúdo lido fica guardado entre os passos para a
 * confirmação reenviar o MESMO arquivo — o backend refaz a avaliação com ele.
 */
export const useImportNfe = ({ onInvoiced }: Args) => {
  const [files, setFiles] = useState<File[]>([]);
  const [contents, setContents] = useState<NfeFile[]>([]);
  const [previews, setPreviews] = useState<NfePreviewRow[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [previewMutation] = useMutation<PreviewNfeImportResponse>(
    PREVIEW_NFE_IMPORT_MUTATION
  );
  const [invoiceMutation] = useMutation<InvoiceOrdersFromNfeResponse>(
    INVOICE_ORDERS_FROM_NFE_MUTATION
  );
  const previewAction = useAsyncAction();
  const invoiceAction = useAsyncAction();

  const reset = () => {
    setFiles([]);
    setContents([]);
    setPreviews(null);
    setSelected(new Set());
  };

  const runPreview = () =>
    previewAction.execute(async () => {
      if (files.length === 0)
        throw new Error("Escolha ao menos um arquivo XML.");
      const read = await Promise.all(
        files.map(async (file) => ({
          fileName: file.name,
          contentBase64: await fileToBase64(file),
        }))
      );
      const res = await previewMutation({ variables: { files: read } });
      const rows = res.data?.previewNfeImport;
      if (!rows) throw new Error("Não foi possível ler as notas.");
      setContents(read);
      setPreviews(rows);
      setSelected(
        new Set(
          rows.filter((r) => isInvoiceable(r.status)).map((r) => r.fileName)
        )
      );
      return rows;
    });

  const toggle = (fileName: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(fileName)) next.delete(fileName);
      else next.add(fileName);
      return next;
    });

  const runInvoice = () =>
    invoiceAction.execute(
      async () => {
        const chosen = (previews ?? []).filter(
          (row) =>
            selected.has(row.fileName) &&
            isInvoiceable(row.status) &&
            row.orderId
        );
        if (chosen.length === 0)
          throw new Error("Marque ao menos uma nota pronta para faturar.");
        const payload = chosen.map((row) => ({
          fileName: row.fileName,
          orderId: row.orderId,
          contentBase64:
            contents.find((c) => c.fileName === row.fileName)?.contentBase64 ??
            "",
        }));
        const res = await invoiceMutation({ variables: { files: payload } });
        const outcomes = res.data?.invoiceOrdersFromNfe ?? [];
        const invoiced = outcomes.filter((o) => o.isInvoiced).length;
        const failed = outcomes.filter((o) => !o.isInvoiced);
        if (invoiced === 0)
          throw new Error(failed[0]?.message ?? "Nenhum pedido foi faturado.");
        return { invoiced, failed };
      },
      {
        successMessage: ({ invoiced, failed }) =>
          failed.length > 0
            ? `${invoiced} pedido(s) faturado(s). ${failed.length} nota(s) não entraram: ${failed[0].message}`
            : `${invoiced} pedido(s) faturado(s) pelas notas.`,
        onSuccess: () => {
          reset();
          onInvoiced();
        },
      }
    );

  return {
    files,
    setFiles,
    previews,
    selected,
    toggle,
    reset,
    runPreview,
    runInvoice,
    isPreviewing: previewAction.isLoading,
    isInvoicing: invoiceAction.isLoading,
  };
};
