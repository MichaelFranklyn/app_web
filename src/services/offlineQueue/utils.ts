import { CombinedGraphQLErrors, ServerError } from "@apollo/client/errors";

import {
  OfflineEntry,
  StockObservationsEntry,
  VisitStatusEntry,
} from "./interface";

/**
 * Quanto tempo um registro guardado ainda vale. Depois disso ele é descartado
 * sem envio: a visita de mais de uma semana já foi fechada pelo job de visitas
 * vencidas, e o backend conta o estoque a partir de hoje quando a data passa
 * dessa janela (`MAX_OBSERVATION_AGE_DAYS` em `save_observations.py`).
 */
export const MAX_ENTRY_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Quanto se espera a gravação responder antes de guardá-la no aparelho. Sinal
 * ruim não recusa a conexão, ele a deixa pendurada — e sem este teto o botão
 * gira até a pessoa desistir.
 */
export const SEND_TIMEOUT_MS = 10_000;

/** Respostas do nosso próprio caminho dizendo "não consegui chegar ao backend". */
const UNREACHABLE_STATUS = new Set([502, 503, 504]);

/**
 * O erro diz que a gravação NÃO chegou (ou pode não ter chegado) ao servidor?
 *
 * Só isso vai para a fila. Recusa do servidor — permissão, validação, visita
 * apagada — não melhora com o tempo; guardá-la seria reenviar para sempre algo
 * que vai falhar sempre.
 */
export function isConnectivityError(error: unknown): boolean {
  // `fetch` sem rede: "Failed to fetch" (Chrome), "Load failed" (Safari).
  if (error instanceof TypeError) return true;
  // O teto de espera (`AbortSignal.timeout`) ou o abort manual.
  if (
    error instanceof DOMException &&
    (error.name === "TimeoutError" || error.name === "AbortError")
  ) {
    return true;
  }
  return ServerError.is(error) && UNREACHABLE_STATUS.has(error.statusCode);
}

/**
 * A sessão caiu (token vencido, logout noutra aba)?
 *
 * Também é motivo para ESPERAR, não para descartar: o registro continua
 * válido, só falta a pessoa entrar de novo. Tratar como recusa jogaria fora a
 * manhã inteira de visitas de quem ficou sem sinal até o token vencer.
 */
export function isSessionError(error: unknown): boolean {
  if (ServerError.is(error)) return error.statusCode === 401;
  return (
    CombinedGraphQLErrors.is(error) &&
    error.errors.some((e) => e.extensions?.code === 401)
  );
}

/** Troca a entrada do mesmo assunto; a nova vai para o fim da fila. */
export function upsertEntry(
  entries: OfflineEntry[],
  entry: OfflineEntry
): OfflineEntry[] {
  return [...entries.filter((e) => e.key !== entry.key), entry];
}

/** Tira da fila o que passou da validade. */
export function dropExpired(
  entries: OfflineEntry[],
  now: number
): OfflineEntry[] {
  return entries.filter(
    (e) => now - new Date(e.createdAt).getTime() <= MAX_ENTRY_AGE_MS
  );
}

/** Dia local (YYYY-MM-DD) de um instante — o dia em que o vendedor estava lá. */
export function localDay(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "1 registro" / "3 registros". */
export function recordsLabel(count: number): string {
  return count === 1 ? "1 registro" : `${count} registros`;
}

/** Status que encerram a visita — os que carregam a hora em que aconteceu. */
const TERMINAL_STATUSES = new Set(["COMPLETED", "CLIENT_ABSENT", "NO_TIME"]);

/** Entrada ainda sem dono: quem enfileira completa com o usuário logado. */
export type EntryDraft =
  | Omit<VisitStatusEntry, "userId">
  | Omit<StockObservationsEntry, "userId">;

/**
 * Resposta a uma visita. A hora da visita é a do toque: enviada horas depois,
 * sem ela o backend carimbaria a hora do ENVIO.
 */
export function visitStatusDraft(
  args: { id: string; status: string; label: string; actualVisitAt?: string },
  now: Date
): EntryDraft {
  const actualVisitAt =
    args.actualVisitAt ??
    (TERMINAL_STATUSES.has(args.status) ? now.toISOString() : undefined);
  return {
    kind: "visitStatus",
    key: `visit:${args.id}`,
    createdAt: now.toISOString(),
    label: args.label,
    variables: {
      id: args.id,
      status: args.status,
      ...(actualVisitAt ? { actualVisitAt } : {}),
    },
  };
}

/** Estoque de uma visita, contado a partir do dia em que foi visto. */
export function stockObservationsDraft(
  args: {
    itemId: string;
    label: string;
    observations: { productId: string; daysRemaining: number | null }[];
  },
  now: Date
): EntryDraft {
  return {
    kind: "stockObservations",
    key: `stock:${args.itemId}`,
    createdAt: now.toISOString(),
    label: args.label,
    variables: {
      itemId: args.itemId,
      observations: args.observations,
      observedOn: localDay(now),
    },
  };
}
