"use client";

import { useApolloClient, useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useLeaveGuard } from "@/hooks/useLeaveGuard";

import { HistoryOrderStatus } from "../interface";
import { useHistoryOptions } from "../useHistoryOptions";
import { useHistoryRun } from "../useHistoryRun";
import {
  CREATE_ORDER_PDF_IMPORT_BATCH_MUTATION,
  MARK_ORDER_PDF_IMPORT_FILES_IMPORTED_MUTATION,
  ORDER_PDF_IMPORT_BATCHES_QUERY,
} from "./gql";
import {
  CreatePdfImportBatchResponse,
  MarkPdfImportFilesResponse,
  PdfFileOverride,
} from "./interface";
import { usePdfBatch } from "./usePdfBatch";
import { usePdfUpload } from "./usePdfUpload";
import { buildPdfRows, importedFileIds } from "./utils";

export const PDF_STEPS = { BATCH: 0, FILES: 1, REVIEW: 2 } as const;

/**
 * O assistente dos PDFs: abre o lote (fábrica, vendedor, status), sobe e lê
 * os PDFs e importa pelo mesmo caminho da planilha (`importOrderHistory`). O
 * lote fica no endereço (`?batch=`): fechar a aba não perde o que já foi lido.
 */
export function usePdfImportWizard(initialBatchId: string | null) {
  const router = useRouter();
  const client = useApolloClient();
  const [batchId, setBatchId] = useState(initialBatchId);
  const [step, setStep] = useState<number>(
    initialBatchId ? PDF_STEPS.FILES : PDF_STEPS.BATCH
  );
  const [factoryId, setFactoryId] = useState<string | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [defaultStatus, setDefaultStatus] =
    useState<HistoryOrderStatus>("DELIVERED");
  const [overrides, setOverrides] = useState<Record<string, PdfFileOverride>>(
    {}
  );
  const [createMissingClients, setCreateMissingClients] = useState(false);
  const [createMissingProducts, setCreateMissingProducts] = useState(false);

  const options = useHistoryOptions();
  const upload = usePdfUpload(batchId);
  const pdf = usePdfBatch(batchId, upload.sending);
  const run = useHistoryRun();
  const leave = useLeaveGuard(upload.sending || run.running);
  const creating = useAsyncAction();
  const [createBatch] = useMutation<CreatePdfImportBatchResponse>(
    CREATE_ORDER_PDF_IMPORT_BATCH_MUTATION
  );
  const [markImported] = useMutation<MarkPdfImportFilesResponse>(
    MARK_ORDER_PDF_IMPORT_FILES_IMPORTED_MUTATION
  );

  const build = useMemo(
    () =>
      pdf.batch
        ? buildPdfRows(pdf.batch, pdf.files, overrides)
        : { rows: [], problems: [], labels: {}, fileIds: [], fileRows: {} },
    [pdf.batch, pdf.files, overrides]
  );

  const setOverride = (fileId: string, change: PdfFileOverride) =>
    setOverrides((all) => ({
      ...all,
      [fileId]: { ...all[fileId], ...change },
    }));

  const openBatch = (id: string | null) => {
    setBatchId(id);
    setOverrides({});
    run.reset();
    router.replace(id ? `?batch=${id}` : "?", { scroll: false });
  };

  const runInput = () => ({
    rows: build.rows,
    problems: build.problems,
    quantityUnit: "UNITS" as const,
    createMissingClients,
    createMissingProducts,
  });

  const submitBatch = () =>
    creating.execute(
      async () => {
        const res = await createBatch({
          variables: { input: { factoryId, sellerId, defaultStatus } },
        });
        const payload = res.data?.createOrderPdfImportBatch;
        if (!payload?.status || !payload.data) {
          throw new Error(payload?.message ?? "Não foi possível abrir o lote.");
        }
        return payload.data;
      },
      {
        errorMessage: "Não foi possível abrir o lote.",
        onSuccess: (batch) => {
          openBatch(batch.id);
          setStep(PDF_STEPS.FILES);
          void client.refetchQueries({
            include: [ORDER_PDF_IMPORT_BATCHES_QUERY],
          });
        },
      }
    );

  const importNow = async () => {
    const result = await run.confirm(runInput());
    if (!result || !batchId) return;
    const fileIds = importedFileIds(build, pdf.files, result);
    if (fileIds.length > 0) {
      // Se falhar, o pior é o PDF continuar "Lido": importar de novo não
      // duplica (o pedido já existe e conta como "já importado").
      await markImported({ variables: { batchId, fileIds } }).catch(() => null);
    }
    void pdf.reload();
    void client.refetchQueries({ include: [ORDER_PDF_IMPORT_BATCHES_QUERY] });
  };

  const next = async () => {
    if (step === PDF_STEPS.BATCH) {
      if (batchId) setStep(PDF_STEPS.FILES);
      else await submitBatch();
    } else if (step === PDF_STEPS.FILES) {
      if (await run.check(runInput())) setStep(PDF_STEPS.REVIEW);
    } else {
      await importNow();
    }
  };

  /** Depois de importar: volta aos PDFs do mesmo lote para mandar mais. */
  const sendMore = () => {
    setOverrides({});
    run.reset();
    setStep(PDF_STEPS.FILES);
  };

  const back = () => {
    if (step === PDF_STEPS.REVIEW) run.resetPreview();
    setStep((s) => Math.max(s - 1, 0));
  };

  const canAdvance =
    step === PDF_STEPS.BATCH
      ? Boolean(batchId || factoryId)
      : step === PDF_STEPS.FILES
        ? !upload.sending && !pdf.reading && build.rows.length > 0
        : (run.preview?.ordersCreated ?? 0) > 0;

  return {
    step,
    setStep,
    batchId,
    openBatch,
    form: {
      factoryId,
      setFactoryId,
      sellerId,
      setSellerId,
      defaultStatus,
      setDefaultStatus,
      creating: creating.isLoading,
    },
    options,
    pdf,
    upload,
    overrides,
    setOverride,
    build,
    run,
    leave,
    createMissingClients,
    setCreateMissingClients,
    createMissingProducts,
    setCreateMissingProducts,
    canAdvance,
    next,
    back,
    sendMore,
  };
}
