import { isConnectivityError } from "@/services/offlineQueue/utils";

import { ImportPriceListResult, PriceListImportJob } from "./interface";

/**
 * Acompanha a importação na fila do backend até ela terminar.
 *
 * Caso real (Padrão Forte, 25/11/2026): a tabela levava 3 minutos dentro de
 * uma requisição só, a conexão caiu ("failed to fetch"), o servidor gravou
 * mesmo assim e o reenvio criou uma segunda tabela. Agora a tela só pergunta
 * "terminou?" — uma pergunta que falha não perde nada, a próxima responde.
 */

export const POLL_INTERVAL_MS = 3_000;
/** Perguntas seguidas sem resposta antes de desistir (~15s sem rede). */
export const MAX_POLL_FAILURES = 5;
/** Teto da espera. O backend já marca como parada a que passa de 8 min. */
export const MAX_WAIT_MS = 10 * 60_000;

export const CONNECTION_LOST_MESSAGE =
  "A conexão caiu, mas a tabela pode ter sido gravada. Confira a lista antes de enviar de novo.";
export const STALE_IMPORT_MESSAGE =
  "A importação parou no meio e parte dela pode ter sido gravada. Confira a lista antes de enviar de novo.";
export const WAIT_TIMEOUT_MESSAGE =
  "A importação está demorando mais que o normal. Confira a lista em alguns minutos antes de enviar de novo.";

const NETWORK_HINT = /failed to fetch|networkerror|load failed|fetch failed/i;

/** A falha é de rede (e não uma recusa do servidor)? */
export function isConnectionLost(error: unknown): boolean {
  if (isConnectivityError(error)) return true;
  return error instanceof Error && NETWORK_HINT.test(error.message);
}

/** Troca o "Failed to fetch" cru pelo aviso de conferir antes de reenviar. */
export function humanizeImportError(error: unknown): Error {
  if (isConnectionLost(error)) return new Error(CONNECTION_LOST_MESSAGE);
  return error instanceof Error ? error : new Error(String(error));
}

export interface WaitOptions {
  intervalMs?: number;
  maxFailures?: number;
  maxWaitMs?: number;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
}

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Pergunta pela importação até DONE/FAILED. Devolve o resultado no DONE e
 * lança com a mensagem do backend no FAILED, ou com o aviso de conferir a
 * lista quando ela morreu no meio (`isStale`) ou a rede não voltou.
 */
export async function waitForImportJob(
  fetchJob: () => Promise<PriceListImportJob>,
  {
    intervalMs = POLL_INTERVAL_MS,
    maxFailures = MAX_POLL_FAILURES,
    maxWaitMs = MAX_WAIT_MS,
    sleep = defaultSleep,
    now = Date.now,
  }: WaitOptions = {}
): Promise<{ data: ImportPriceListResult; message: string }> {
  const deadline = now() + maxWaitMs;
  let failures = 0;
  for (;;) {
    let job: PriceListImportJob | null = null;
    try {
      job = await fetchJob();
      failures = 0;
    } catch (error) {
      // Recusa do servidor (sem permissão, não encontrada) não melhora
      // esperando; só a rede ganha outra chance.
      if (!isConnectionLost(error)) throw error;
      failures += 1;
      if (failures >= maxFailures) throw new Error(CONNECTION_LOST_MESSAGE);
    }
    if (job) {
      if (job.status === "DONE") {
        if (!job.result) throw new Error(STALE_IMPORT_MESSAGE);
        return { data: job.result, message: job.message ?? "" };
      }
      if (job.status === "FAILED") {
        throw new Error(job.error ?? STALE_IMPORT_MESSAGE);
      }
      if (job.isStale) throw new Error(STALE_IMPORT_MESSAGE);
    }
    if (now() >= deadline) throw new Error(WAIT_TIMEOUT_MESSAGE);
    await sleep(intervalMs);
  }
}
