import {
  CLIENT_STOCK_CACHE_FIELDS,
  VISIT_CACHE_FIELDS,
} from "@/utils/cacheFields";
import { ApolloClient } from "@apollo/client";

import {
  OFFLINE_STOCK_OBSERVATIONS_MUTATION,
  OFFLINE_VISIT_STATUS_MUTATION,
} from "./gql";
import { OfflineEntry } from "./interface";
import { getQueueState, settle } from "./store";
import { isConnectivityError, isSessionError, SEND_TIMEOUT_MS } from "./utils";

interface Payload {
  status: boolean;
  message: string;
}

/** O que cada tipo de registro desatualiza no cache quando finalmente chega. */
export const STALE_AFTER_SEND: Record<OfflineEntry["kind"], string[]> = {
  visitStatus: VISIT_CACHE_FIELDS,
  stockObservations: [...CLIENT_STOCK_CACHE_FIELDS, ...VISIT_CACHE_FIELDS],
};

/**
 * Envia UMA entrada. Devolve normalmente se o servidor aceitou; lança o erro da
 * rede ou a recusa, e quem chama decide o que cada um significa.
 */
export async function sendEntry(
  client: ApolloClient,
  entry: OfflineEntry,
  signal?: AbortSignal
): Promise<void> {
  const context = signal ? { fetchOptions: { signal } } : undefined;
  let payload: Payload | undefined;

  if (entry.kind === "visitStatus") {
    const { id, ...input } = entry.variables;
    const res = await client.mutate<{ updateVisitScheduleItem?: Payload }>({
      mutation: OFFLINE_VISIT_STATUS_MUTATION,
      variables: { id, input },
      context,
    });
    payload = res.data?.updateVisitScheduleItem;
  } else {
    const res = await client.mutate<{ saveVisitStockObservations?: Payload }>({
      mutation: OFFLINE_STOCK_OBSERVATIONS_MUTATION,
      variables: entry.variables,
      context,
    });
    payload = res.data?.saveVisitStockObservations;
  }

  if (!payload?.status) {
    throw new Error(payload?.message ?? "O servidor não aceitou o registro.");
  }
}

export interface FlushResult {
  sent: OfflineEntry[];
  rejected: number;
}

// Uma descarga por vez nesta aba: o gatilho do `online` e o do intervalo podem
// cair juntos, e duas descargas paralelas mandariam a mesma entrada duas vezes.
let running: Promise<FlushResult> | null = null;

/**
 * Envia o que está guardado, na ordem em que foi feito, e para no primeiro
 * sinal de rede ruim ou de sessão vencida — o resto espera a próxima
 * tentativa, sem pular a vez.
 *
 * Recusa do servidor tira a entrada da fila e registra o motivo: a pessoa
 * precisa saber que aquela visita não foi gravada, e insistir não muda nada.
 */
export function flushQueue(
  client: ApolloClient,
  userId: string
): Promise<FlushResult> {
  running ??= drain(client, userId).finally(() => {
    running = null;
  });
  return running;
}

async function drain(
  client: ApolloClient,
  userId: string
): Promise<FlushResult> {
  const result: FlushResult = { sent: [], rejected: 0 };
  const mine = getQueueState().entries.filter((e) => e.userId === userId);

  for (const entry of mine) {
    try {
      await sendEntry(client, entry, AbortSignal.timeout(SEND_TIMEOUT_MS));
      settle(entry);
      result.sent.push(entry);
    } catch (error) {
      if (isConnectivityError(error) || isSessionError(error)) break;
      settle(entry, {
        key: entry.key,
        userId: entry.userId,
        label: entry.label,
        message:
          error instanceof Error ? error.message : "Erro ao enviar o registro.",
      });
      result.rejected += 1;
    }
  }
  return result;
}
