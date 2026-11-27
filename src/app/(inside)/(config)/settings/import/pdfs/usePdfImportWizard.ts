"use client";

import { useApolloClient, useMutation } from "@apollo/client/react";
import { useMemo, useState } from "react";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useLeaveGuard } from "@/hooks/useLeaveGuard";

import { useHistoryOptions } from "../useHistoryOptions";
import { useHistoryRun } from "../useHistoryRun";
import {
  CHANGE_ORDER_PDF_IMPORT_BATCH_FACTORY_MUTATION,
  CREATE_ORDER_PDF_IMPORT_BATCH_MUTATION,
  MARK_ORDER_PDF_IMPORT_FILES_IMPORTED_MUTATION,
  ORDER_PDF_IMPORT_BATCHES_QUERY,
} from "./gql";
import {
  ChangePdfImportBatchFactoryResponse,
  CreatePdfImportBatchResponse,
  MarkPdfImportFilesResponse,
  PdfDefaults,
  PdfFileOverride,
} from "./interface";
import { usePdfBatch } from "./usePdfBatch";
import { usePdfUpload } from "./usePdfUpload";
import {
  batchDefaults,
  buildPdfRows,
  importedFileIds,
  pdfBatchPath,
} from "./utils";

export const PDF_STEPS = { BATCH: 0, FILES: 1, REVIEW: 2 } as const;

/**
 * O assistente dos PDFs: abre o lote (só a fábrica), sobe e lê até 20 PDFs e,
 * na prévia — ainda sem gravar nada —, acerta vendedor, situação e o cliente
 * que o PDF não identificou. Importa pelo mesmo caminho da planilha
 * (`importOrderHistory`). O lote fica no endereço (`/settings/import/pdfs/<id>`):
 * fechar a aba não perde o que já foi lido. Enquanto nada do lote virou pedido,
 * voltar ao passo 1 deixa trocar a fábrica (os PDFs lidos são relidos).
 */
export function usePdfImportWizard(initialBatchId: string | null) {
  const client = useApolloClient();
  const [batchId, setBatchId] = useState(initialBatchId);
  const [step, setStep] = useState<number>(
    initialBatchId ? PDF_STEPS.FILES : PDF_STEPS.BATCH
  );
  // A fábrica escolhida no passo 1; com o lote aberto, nulo = a do lote.
  const [factoryChoice, setFactoryChoice] = useState<string | null>(null);
  // O que a pessoa mudou nos padrões; o resto vem do lote (os lotes antigos
  // ainda guardam vendedor e situação).
  const [defaultsChange, setDefaultsChange] = useState<Partial<PdfDefaults>>(
    {}
  );
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
  const [changeFactory] = useMutation<ChangePdfImportBatchFactoryResponse>(
    CHANGE_ORDER_PDF_IMPORT_BATCH_FACTORY_MUTATION
  );
  const [markImported] = useMutation<MarkPdfImportFilesResponse>(
    MARK_ORDER_PDF_IMPORT_FILES_IMPORTED_MUTATION
  );

  const factoryId = factoryChoice ?? pdf.batch?.factoryId ?? null;
  const factoryLocked = (pdf.batch?.importedFiles ?? 0) > 0;
  const factoryChanged = Boolean(
    pdf.batch && factoryId && factoryId !== pdf.batch.factoryId
  );

  const defaults = useMemo<PdfDefaults>(() => {
    const base: PdfDefaults = pdf.batch
      ? batchDefaults(pdf.batch)
      : { sellerId: null, status: "DELIVERED" };
    return { ...base, ...defaultsChange };
  }, [pdf.batch, defaultsChange]);

  const setDefaults = (change: Partial<PdfDefaults>) =>
    setDefaultsChange((all) => ({ ...all, ...change }));

  const build = useMemo(
    () =>
      pdf.batch
        ? buildPdfRows(pdf.batch, pdf.files, overrides, defaults)
        : { rows: [], problems: [], labels: {}, fileIds: [], fileRows: {} },
    [pdf.batch, pdf.files, overrides, defaults]
  );

  const setOverride = (fileId: string, change: PdfFileOverride) =>
    setOverrides((all) => ({
      ...all,
      [fileId]: { ...all[fileId], ...change },
    }));

  /**
   * O lote recém-aberto passa a morar no endereço dele sem remontar a tela
   * (o `replaceState` do navegador conversa com o roteador do Next).
   */
  const openBatch = (id: string) => {
    setBatchId(id);
    setOverrides({});
    setDefaultsChange({});
    run.reset();
    window.history.replaceState(null, "", pdfBatchPath(id));
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
          variables: { input: { factoryId } },
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

  /**
   * Troca a fábrica do lote: os PDFs lidos voltam para a leitura com o modelo
   * da nova fábrica, então os acertos feitos na prévia de cada um caem.
   */
  const submitFactory = (id: string, nextFactoryId: string) =>
    creating.execute(
      async () => {
        const res = await changeFactory({
          variables: { id, factoryId: nextFactoryId },
        });
        const payload = res.data?.changeOrderPdfImportBatchFactory;
        if (!payload?.status) {
          throw new Error(
            payload?.message ?? "Não foi possível trocar a fábrica."
          );
        }
      },
      {
        errorMessage: "Não foi possível trocar a fábrica.",
        onSuccess: () => {
          setFactoryChoice(null);
          setOverrides({});
          run.reset();
          void pdf.reload();
          void client.refetchQueries({
            include: [ORDER_PDF_IMPORT_BATCHES_QUERY],
          });
          setStep(PDF_STEPS.FILES);
        },
      }
    );

  const importNow = async () => {
    const result = await run.confirm(runInput());
    if (!result || !batchId) return;
    const fileIds = importedFileIds(build, pdf.files, result, overrides);
    if (fileIds.length > 0) {
      // Se falhar, o pior é o PDF continuar "Lido": importar de novo não
      // duplica (o pedido já existe e conta como "já importado").
      // `historyBatchId` amarra o PDF à importação: desfazê-la o devolve a
      // "Lido", pronto para importar de novo.
      await markImported({
        variables: { batchId, fileIds, historyBatchId: result.batchId ?? null },
      }).catch(() => null);
    }
    void pdf.reload();
    void client.refetchQueries({ include: [ORDER_PDF_IMPORT_BATCHES_QUERY] });
  };

  const next = async () => {
    if (step === PDF_STEPS.BATCH) {
      if (!batchId) await submitBatch();
      else if (factoryChanged && factoryId) {
        await submitFactory(batchId, factoryId);
      } else setStep(PDF_STEPS.FILES);
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
      ? Boolean(factoryId)
      : step === PDF_STEPS.FILES
        ? !upload.sending && !pdf.reading && build.rows.length > 0
        : (run.preview?.ordersCreated ?? 0) > 0;

  return {
    step,
    setStep,
    batchId,
    form: {
      factoryId,
      setFactoryId: setFactoryChoice,
      factoryLocked,
      factoryChanged,
      creating: creating.isLoading,
    },
    defaults,
    setDefaults,
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
