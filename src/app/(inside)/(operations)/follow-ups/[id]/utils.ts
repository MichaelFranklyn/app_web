/** Um dia a mais/menos sobre um ISO aaaa-mm-dd, sem passar por fuso. */
export const addDaysIso = (iso: string, days: number): string => {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
};

/**
 * Os atalhos de data dos modais — o que quase todo mundo escolhe. Tocar num
 * botão é mais fácil que navegar num calendário, sobretudo no celular.
 */
export const quickDates = (todayIso: string) => [
  { label: "Amanhã", value: addDaysIso(todayIso, 1) },
  { label: "Em 1 semana", value: addDaysIso(todayIso, 7) },
  { label: "Em 15 dias", value: addDaysIso(todayIso, 15) },
  { label: "Em 1 mês", value: addDaysIso(todayIso, 30) },
];

/** "segunda-feira" — dito por extenso ao lado da data escolhida. */
export const weekdayName = (iso: string): string => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
};

/** O dia do contato a fazer: escolhido e não no passado (o backend recusaria). */
export const isSchedulable = (iso: string, todayIso: string): boolean =>
  Boolean(iso) && iso >= todayIso;

/**
 * O motivo do cancelamento foi escrito? Só espaço não conta — é a mesma régua
 * do servidor (`clean_cancel_reason`), que recusa o cancelamento sem ele.
 */
export const hasCancelReason = (reason: string): boolean =>
  reason.trim().length > 0;
