import { Notification, NotificationSeverity } from "./interface";

/**
 * A tela que mostra o que está pendente e por quê.
 *
 * O sino avisa; os insights explicam e apontam a saída. Notificação de insight
 * não tem registro para abrir — a conclusão É o conteúdo —, então ela leva para
 * cá, onde o mesmo assunto aparece com o número de hoje e o motivo por extenso.
 */
export const INSIGHTS_ROUTE = "/insights";

export const SEVERITY_DOT: Record<NotificationSeverity, string> = {
  INFO: "bg-(--blue)",
  SUCCESS: "bg-(--green)",
  WARNING: "bg-(--amber)",
  ERROR: "bg-(--red)",
};

/** Insight é conclusão do sistema, não registro: o aviso é o próprio conteúdo. */
export const isInsight = (n: Pick<Notification, "category">): boolean =>
  n.category === "INSIGHT";

/**
 * Para onde o clique na notificação leva.
 *
 * Insight vai para a tela de insights: lá o mesmo assunto aparece com o número
 * de HOJE, o motivo por extenso e o botão que resolve — o aviso do sino é só a
 * foto do dia em que o job rodou. As demais continuam indo direto ao registro:
 * ali o aviso é só o aviso, e quem interessa é o pedido que mudou de estado.
 */
export const notificationHref = (n: Notification): string | null => {
  if (isInsight(n)) return INSIGHTS_ROUTE;
  return n.link;
};

/** "agora", "12min", "3h", "5d", "2sem" — desde quando o aviso está lá. */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.round(diff / 1000);
  if (sec < 60) return "agora";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}min`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.round(days / 7);
  return `${weeks}sem`;
}
