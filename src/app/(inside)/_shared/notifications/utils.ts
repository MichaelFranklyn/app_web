import { ThemeColor } from "@/lib/theme";
import { Notification, NotificationSeverity } from "./interface";

/**
 * A lista de trabalho — a saída do sino. O sino mostra o que já aconteceu;
 * Pendências, o que ainda precisa ser feito, com o motivo.
 */
export const PENDING_ROUTE = "/pending";

/** As oportunidades comerciais (a antiga /insights). */
export const OPPORTUNITIES_ROUTE = "/opportunities";

/**
 * Para onde cada aviso CONCLUÍDO pelo sistema (categoria INSIGHT) leva — a
 * lista de referência do assunto, já filtrada. Pelo `relatedEntityType`, e não
 * pelo `link` gravado: os avisos antigos guardaram "/agenda", e o clique
 * neles também tem de cair na lista certa.
 *
 * - frequência de visita vencida → Pendências, no tipo;
 * - prioritário fora da rotina → Oportunidades, com o cartão aberto.
 */
const INSIGHT_ROUTES: Record<string, string> = {
  visit_overdue: `${PENDING_ROUTE}?type=VISIT_FREQUENCY`,
  unplanned_priority: `${OPPORTUNITIES_ROUTE}?open=PRIORITY_OFF_ROUTE`,
};

export const SEVERITY_COLOR: Record<NotificationSeverity, ThemeColor> = {
  INFO: "blue",
  SUCCESS: "green",
  WARNING: "amber",
  ERROR: "red",
};

/** Insight é conclusão do sistema, não registro: o aviso é o próprio conteúdo. */
export const isInsight = (n: Pick<Notification, "category">): boolean =>
  n.category === "INSIGHT";

/**
 * Para onde o clique na notificação leva.
 *
 * Insight vai para a lista de referência do assunto: lá ele aparece com o
 * número de HOJE, o motivo por extenso e o caminho que resolve — o aviso do
 * sino é só a foto do dia em que o job rodou. As demais continuam indo direto
 * ao registro: ali o aviso é só o aviso, e quem interessa é o pedido que mudou
 * de estado.
 */
export const notificationHref = (n: Notification): string | null => {
  if (isInsight(n)) {
    return (
      (n.relatedEntityType && INSIGHT_ROUTES[n.relatedEntityType]) ??
      OPPORTUNITIES_ROUTE
    );
  }
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
