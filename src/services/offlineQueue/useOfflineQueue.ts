"use client";

import { UserData } from "@/app/(auth)/login/interface";
import { getCookie } from "@/utils/cookies/clientCookie";
import { useCallback, useMemo, useSyncExternalStore } from "react";

import { OfflineEntry } from "./interface";
import {
  dismissFailures,
  enqueue,
  getQueueState,
  getServerQueueState,
  hasEntriesOf,
  requestFlush,
  subscribeQueue,
} from "./store";
import { EntryDraft, isConnectivityError, SEND_TIMEOUT_MS } from "./utils";

/** Id do usuário logado, lido na hora (o cookie pode ter mudado de dono). */
export function currentUserId(): string | null {
  return getCookie<UserData>("userData")?.userId ?? null;
}

function useQueueState() {
  return useSyncExternalStore(
    subscribeQueue,
    getQueueState,
    getServerQueueState
  );
}

/** A fila de quem está logado: o que espera o sinal e o que o servidor recusou. */
export function useOfflineQueue() {
  const state = useQueueState();
  const userId = currentUserId();
  return useMemo(
    () => ({
      userId,
      entries: state.entries.filter((e) => e.userId === userId),
      failures: state.failures.filter((f) => f.userId === userId),
      dismissFailures: () => userId && dismissFailures(userId),
    }),
    [state, userId]
  );
}

/**
 * O registro guardado de um assunto (`visit:<id>`, `stock:<id>`), se houver.
 * É o que a tela mostra no lugar do que veio do servidor enquanto ele espera.
 */
export function useOfflineEntry(key: string): OfflineEntry | undefined {
  const state = useQueueState();
  return state.entries.find((e) => e.key === key);
}

/** Contexto do Apollo com o teto de espera da gravação. */
export interface SendContext {
  fetchOptions: { signal: AbortSignal };
}

export type SendOutcome<T> = { queued: true } | { queued: false; result: T };

/**
 * Tenta gravar agora; sem sinal, guarda no aparelho.
 *
 * `send` faz a gravação de sempre (com o documento e o retorno que a tela já
 * usa) e lança se o servidor recusar. Só a falta de rede vira fila — a recusa
 * continua chegando a quem chamou, como antes.
 *
 * Se já há registro esperando, o novo entra atrás dele sem tentar a rede, e a
 * fila é chamada a descarregar na hora. Duas razões: enviado direto, ele
 * chegaria ANTES do antigo — e o antigo, ao chegar depois, desfaria a resposta
 * nova (concluir guardado, reabrir enviado, "concluída" chegando por último); e
 * com a fila cheia o mais provável é que ainda não haja sinal, então tentar
 * seria fazer a pessoa esperar os 10 segundos do teto à toa.
 */
export function useSendOrQueue() {
  return useCallback(
    async <T>(
      draft: EntryDraft,
      send: (context: SendContext) => Promise<T>
    ): Promise<SendOutcome<T>> => {
      const userId = currentUserId();
      // Sem saber de quem é, não se guarda: o registro poderia ser enviado
      // depois na sessão de outra pessoa.
      if (!userId) {
        return { queued: false, result: await send(timeoutContext()) };
      }

      const entry = { ...draft, userId } as OfflineEntry;
      if (hasEntriesOf(userId) || !navigator.onLine) {
        enqueue(entry);
        if (navigator.onLine) requestFlush();
        return { queued: true };
      }

      try {
        return { queued: false, result: await send(timeoutContext()) };
      } catch (error) {
        if (!isConnectivityError(error)) throw error;
        enqueue(entry);
        return { queued: true };
      }
    },
    []
  );
}

function timeoutContext(): SendContext {
  return { fetchOptions: { signal: AbortSignal.timeout(SEND_TIMEOUT_MS) } };
}
