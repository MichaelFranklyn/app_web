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
