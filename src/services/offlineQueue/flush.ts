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
import { refreshQueueState, settle } from "./store";
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

/** Nome da trava entre abas (Web Locks) — uma por origem, vale para o PWA também. */
export const FLUSH_LOCK = "girus:offline-queue:flush";

const NOTHING: FlushResult = { sent: [], rejected: 0 };

/**
 * Uma descarga por vez no APARELHO, não só na aba. Com o app aberto em duas
 * abas (ou aba + PWA instalado), o sinal volta para as duas ao mesmo tempo e
 * cada uma mandava a fila inteira. O servidor aguenta a repetição — as duas
 * gravações são repetíveis —, mas a segunda aba podia reenviar uma resposta
 * ANTIGA por cima de uma nova que a primeira acabara de gravar.
 *
 * Quem não pega a trava não espera: a outra aba já está enviando, e o
 * resultado chega a esta pelo evento `storage`.
 */
async function withFlushLock(
  work: () => Promise<FlushResult>
): Promise<FlushResult> {
  const locks = typeof navigator === "undefined" ? undefined : navigator.locks;
  // Navegador sem Web Locks: fica a trava da aba, como era antes.
  if (!locks) return work();
  return locks.request(FLUSH_LOCK, { ifAvailable: true }, (lock) =>
    lock ? work() : NOTHING
  );
}

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
  running ??= withFlushLock(() => drain(client, userId)).finally(() => {
    running = null;
  });
  return running;
}

const isSameEntry = (a: OfflineEntry, b: OfflineEntry) =>
  a.key === b.key && a.userId === b.userId && a.createdAt === b.createdAt;

async function drain(
  client: ApolloClient,
  userId: string
): Promise<FlushResult> {
  const result: FlushResult = { sent: [], rejected: 0 };
  // Do armazenamento, não da memória: outra aba pode ter esvaziado a fila.
  const mine = refreshQueueState().entries.filter((e) => e.userId === userId);

  for (const entry of mine) {
    // Trocada ou enviada enquanto esperava a vez: a versão nova fica para a
    // próxima descarga, e a antiga não vai por cima dela.
    if (!refreshQueueState().entries.some((e) => isSameEntry(e, entry))) {
      continue;
    }
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
