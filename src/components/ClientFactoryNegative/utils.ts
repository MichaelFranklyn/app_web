import { formatDate } from "@/utils/format/date";

/**
 * "Negativado em 12/08/2026 (há 25 dias)" — o texto da tarja e do modal.
 *
 * O tempo decorrido vai junto porque é ele que diz se a situação é de ontem ou
 * de três meses atrás: a data sozinha obriga o vendedor a fazer a conta de
 * cabeça toda vez que abre a tela.
 */
export function negativeSinceLabel(since: string | null): string {
  if (!since) return "Negativado";
  const days = daysSince(since);
  if (days === null) return `Negativado desde ${formatDate(since)}`;
  if (days <= 0) return `Negativado hoje (${formatDate(since)})`;
  if (days === 1) return `Negativado ontem (${formatDate(since)})`;
  return `Negativado há ${days} dias (desde ${formatDate(since)})`;
}

/** Dias corridos entre a data (dia de calendário) e hoje. */
export function daysSince(date: string | null): number | null {
  if (!date) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  if (!match) return null;
  const [, year, month, day] = match;
  const then = new Date(Number(year), Number(month) - 1, Number(day));
  const today = new Date();
  const midnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  return Math.round((midnight.getTime() - then.getTime()) / 86_400_000);
}

/**
 * O texto completo para tooltip/descrição: desde quando e por quê.
 *
 * Sem o motivo a tarja vira um bloqueio sem explicação — o vendedor vê que não
 * pode vender e não tem como saber o que precisa acontecer para destravar.
 */
export function negativeTooltip(
  since: string | null,
  reason: string | null
): string {
  const head = negativeSinceLabel(since);
  return reason ? `${head}. Motivo: ${reason}` : head;
}

/**
 * A dica do campo "Cliente" quando ele está negativado na fábrica escolhida.
 *
 * Diz o mesmo que o backend responderia na recusa — só que antes de o pedido
 * ser digitado. Compartilhada pelas entradas de pedido para que o vendedor leia
 * a mesma frase venha por onde vier (novo pedido, importação de ficha).
 */
export function negativeOrderHint(reason?: string | null): string {
  const why = reason ? ` (${reason})` : "";
  return `Esta fábrica suspendeu o crédito deste cliente${why}. Ela não aceita pedido novo dele — retire a negativação no vínculo da fábrica antes de lançar.`;
}
