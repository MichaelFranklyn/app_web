"use client";

import { useApolloClient, useMutation } from "@apollo/client/react";
import { useCallback, useRef, useState } from "react";

import { putUpload } from "@/services/upload";

import {
  ADD_ORDER_PDF_IMPORT_FILE_MUTATION,
  ORDER_PDF_IMPORT_BATCH_QUERY,
} from "./gql";
import { AddPdfImportFileResponse, PdfUploadState } from "./interface";
import { UPLOAD_CONCURRENCY, hashFile } from "./utils";

/**
 * Sobe os PDFs direto à API, dois por vez: assina cada arquivo (o mesmo PDF
 * não entra duas vezes), registra no lote e manda o arquivo cru. O servidor lê
 * o PDF na hora do envio; ao fim de cada um, a lista busca o resultado.
 *
 * Os arquivos ficam guardados pelo nome enquanto a tela está aberta, para o
 * "Enviar de novo" de uma leitura que caiu no meio não pedir o arquivo outra vez.
 */
export function usePdfUpload(batchId: string | null) {
  const client = useApolloClient();
  const [addFile] = useMutation<AddPdfImportFileResponse>(
    ADD_ORDER_PDF_IMPORT_FILE_MUTATION
  );
  const [uploads, setUploads] = useState<PdfUploadState[]>([]);
  const queue = useRef<{ key: string; file: File }[]>([]);
  const active = useRef(0);
  const known = useRef(new Map<string, File>());
  const seq = useRef(0);
  // Espelho do `known` para a tela (ref não se lê durante o render).
  const [knownNames, setKnownNames] = useState<ReadonlySet<string>>(new Set());

  const patch = (key: string, change: Partial<PdfUploadState>) =>
    setUploads((list) =>
      list.map((u) => (u.key === key ? { ...u, ...change } : u))
    );

  const send = useCallback(
    async (key: string, file: File) => {
      patch(key, { phase: "sending" });
      try {
        const res = await addFile({
          variables: {
            input: {
              batchId,
              fileName: file.name,
              size: file.size,
              sha256: await hashFile(file),
            },
          },
        });
        const payload = res.data?.addOrderPdfImportFile;
        if (!payload?.status || !payload.data) {
          throw new Error(
            payload?.message ?? "Não foi possível registrar o PDF."
          );
        }
        if (payload.data.ticket) {
          await putUpload(
            payload.data.uploadUrlPath,
            payload.data.ticket,
            file
          );
        }
        patch(key, { phase: "done" });
      } catch (err) {
        patch(key, {
          phase: "error",
          error:
            err instanceof Error
              ? err.message
              : "Não foi possível enviar o PDF.",
        });
      } finally {
        void client.refetchQueries({ include: [ORDER_PDF_IMPORT_BATCH_QUERY] });
      }
    },
    [addFile, batchId, client]
  );

  const pump = useCallback(() => {
    while (active.current < UPLOAD_CONCURRENCY && queue.current.length > 0) {
      const job = queue.current.shift()!;
      active.current += 1;
      void send(job.key, job.file).finally(() => {
        active.current -= 1;
        pump();
      });
    }
  }, [send]);

  const add = useCallback(
    (files: File[]) => {
      if (!batchId || files.length === 0) return;
      const jobs = files.map((file) => {
        seq.current += 1;
        known.current.set(file.name, file);
        return { key: `${seq.current}-${file.name}`, file };
      });
      setKnownNames(new Set(known.current.keys()));
      setUploads((list) => [
        ...list,
        ...jobs.map((j) => ({
          key: j.key,
          fileName: j.file.name,
          phase: "queued" as const,
        })),
      ]);
      queue.current.push(...jobs);
      pump();
    },
    [batchId, pump]
  );

  /** Manda de novo um PDF que já passou por esta tela; falso = precisa escolher o arquivo. */
  const resend = useCallback(
    (fileName: string) => {
      const file = known.current.get(fileName);
      if (!file) return false;
      add([file]);
      return true;
    },
    [add]
  );

  const sending = uploads.some(
    (u) => u.phase === "queued" || u.phase === "sending"
  );
  const failed = uploads.filter((u) => u.phase === "error");

  return {
    add,
    resend,
    canResend: (fileName: string) => knownNames.has(fileName),
    sending,
    progress: {
      done: uploads.filter((u) => u.phase === "done" || u.phase === "error")
        .length,
      total: uploads.length,
    },
    failed,
    clearFailed: () =>
      setUploads((list) => list.filter((u) => u.phase !== "error")),
  };
}
