import { OverdueOutcome } from "./interface";

/** Confirmação de cada resposta, na voz de quem registrou o que houve. */
export const ANSWER_MESSAGE: Record<OverdueOutcome, string> = {
  COMPLETED: "Visita registrada",
  CLIENT_ABSENT: "Registrado: cliente não estava",
  NO_TIME: "Registrado: não deu tempo",
};

/**
 * O horário do dia planejado que vale como "hora da visita" quando a resposta
 * vem atrasada.
 *
 * Sem enviá-lo, o backend carimba AGORA: a visita de sexta entraria no
 * histórico do cliente como visita de hoje, e a cadência do score (que parte de
 * `lastVisitDate`) começaria a contar da data errada.
 *
 * Meio-dia LOCAL, não meia-noite: o backend converte para UTC e, no fuso do
 * Brasil, `00:00` local volta para o dia anterior.
 */
const MIDDAY = 12;

export const plannedMoment = (isoDate: string): string | null => {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day, MIDDAY).toISOString();
};
