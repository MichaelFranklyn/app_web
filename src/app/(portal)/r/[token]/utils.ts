import { formatDate } from "@/utils/format/date";

import { VisitResponseForm, VisitResponseStop } from "./interface";

export interface VisitAnswerPayload {
  itemId: string;
  status: string;
  outcome?: string;
  notes?: string;
  hadOrder?: boolean;
}

/**
 * Monta as respostas a partir dos campos do formulário.
 *
 * Mora FORA de `actions.ts`: aquele arquivo é `"use server"`, e um módulo de
 * Server Action só pode exportar funções async — exportar este helper de lá
 * quebra o build (e o `tsc` não avisa; quem avisa é o Turbopack). Ver
 * [[feedback_pure_helpers_out_of_server_tainted_modules]].
 *
 * Só entra a parada cuja SITUAÇÃO foi escolhida. O vendedor responde oito
 * clientes numa tela de celular, no fim do dia, e muitas vezes só sabe dizer de
 * cinco — mandar as outras três como "pendente" gravaria um desfecho que ele
 * não deu, e o que ele deixou em branco é justamente a informação de que ainda
 * não sabe.
 */
export const buildAnswers = (formData: FormData): VisitAnswerPayload[] => {
  const answers: VisitAnswerPayload[] = [];

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("status__")) continue;

    const status = String(value).trim();
    if (!status) continue;

    const itemId = key.replace("status__", "");
    const outcome = String(formData.get(`outcome__${itemId}`) ?? "").trim();
    const notes = String(formData.get(`notes__${itemId}`) ?? "").trim();

    answers.push({
      itemId,
      status,
      ...(outcome ? { outcome } : {}),
      ...(notes ? { notes } : {}),
      // A caixa só aparece no FormData quando marcada — o não marcado some, que
      // é o comportamento nativo do checkbox.
      ...(formData.get(`order__${itemId}`) ? { hadOrder: true } : {}),
    });
  }

  return answers;
};

/** "Semana de 21/09 a 27/09" ou "Rota de 21/09/2026" — o título da folha. */
export const formPeriodLabel = (
  form: Pick<VisitResponseForm, "date" | "endDate" | "isWeek">
): string =>
  form.isWeek && form.endDate
    ? `Semana de ${formatDate(form.date)} a ${formatDate(form.endDate)}`
    : `Rota de ${formatDate(form.date)}`;

/** "segunda-feira, 21/09/2026". A data vem sem hora: lida em UTC para não
 * escorregar um dia no fuso do navegador. */
export const dayHeading = (iso: string): string => {
  const weekday = new Date(`${iso}T00:00:00Z`).toLocaleDateString("pt-BR", {
    weekday: "long",
    timeZone: "UTC",
  });
  return `${weekday}, ${formatDate(iso)}`;
};

/** As paradas por dia, na ordem em que chegaram (o backend já ordena). */
export const groupStopsByDate = (
  stops: VisitResponseStop[]
): { date: string; stops: VisitResponseStop[] }[] => {
  const groups: { date: string; stops: VisitResponseStop[] }[] = [];
  for (const stop of stops) {
    const last = groups[groups.length - 1];
    if (last && last.date === stop.date) last.stops.push(stop);
    else groups.push({ date: stop.date, stops: [stop] });
  }
  return groups;
};
