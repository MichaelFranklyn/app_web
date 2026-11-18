"use client";

import { useQuery } from "@apollo/client/react";
import { useEffect } from "react";

import { ORDER_PDF_IMPORT_BATCH_QUERY } from "./gql";
import { PdfImportBatchResponse } from "./interface";
import { POLL_INTERVAL_MS } from "./utils";

/**
 * O lote aberto, com cada PDF. Enquanto algum ainda está sendo lido (e não
 * caiu no meio do envio), pergunta de novo a cada poucos segundos.
 */
export function usePdfBatch(batchId: string | null, sending: boolean) {
  const { data, loading, error, refetch, startPolling, stopPolling } =
    useQuery<PdfImportBatchResponse>(ORDER_PDF_IMPORT_BATCH_QUERY, {
      variables: { id: batchId },
      skip: !batchId,
      fetchPolicy: "cache-and-network",
    });
  const payload = data?.orderPdfImportBatch;
  const batch = payload?.status ? payload.data : null;
  const files = batch?.files ?? [];
  const reading = files.some((f) => f.status === "PENDING" && !f.isStale);

  useEffect(() => {
    if (!batchId || !(reading || sending)) return;
    startPolling(POLL_INTERVAL_MS);
    return () => stopPolling();
  }, [batchId, reading, sending, startPolling, stopPolling]);

  return {
    batch,
    files,
    reading,
    loading: loading && !batch,
    error:
      error ?? (payload && !payload.status ? new Error(payload.message) : null),
    reload: () => refetch(),
  };
}
