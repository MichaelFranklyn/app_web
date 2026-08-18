"use client";

import { useState } from "react";
import { RescheduleVisitModal } from "../VisitActions/RescheduleVisitModal";
import { OverdueVisitsBanner } from "./OverdueVisitsBanner";
import { OverdueVisitsPanel } from "./OverdueVisitsPanel";
import { OverdueOutcome, OverdueVisit } from "./interface";
import { ANSWER_MESSAGE } from "./utils";
import { useOverdueVisits } from "./useOverdueVisits";

interface Props {
  /** Vendedor da rotina em tela. Ausente = o próprio usuário logado. */
  sellerId?: string | null;
  /** O gestor acompanha, mas quem responde pelo que houve é o vendedor. */
  canAnswer: boolean;
  /** A resposta muda a rotina em volta (vaga do dia, score do cliente). */
  onAnswered: () => void;
}

/**
 * A dívida da rotina: visitas de dias que já passaram e que ninguém marcou.
 *
 * Enquanto ninguém diz o que houve, o sistema não sabe se a visita aconteceu —
 * `lastVisitDate` não anda, o cliente segue "atrasado" e volta ao plano como se
 * nunca tivesse sido agendado. O que ficar sem resposta por uma semana é
 * encerrado pelo job `close_stale_visits`.
 *
 * Na tela do dia, essa dívida NÃO pode competir com a rota: quem abre
 * `/routines/<dia>` quer ver por onde passar hoje. Por isso o que fica no fluxo
 * da página é só um aviso de uma linha — a lista de pendências mora num painel
 * lateral, que o vendedor abre quando decide responder.
 */
export function OverdueVisits({ sellerId, canAnswer, onAnswered }: Props) {
  const { visits, loading, answeringId, answer, refetch } =
    useOverdueVisits(sellerId);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [rescheduling, setRescheduling] = useState<OverdueVisit | null>(null);

  // Sem dívida, nada aparece: cobrar nada é ruído na tela de trabalho.
  if (loading || visits.length === 0) return null;

  const handleAnswer = (visit: OverdueVisit, outcome: OverdueOutcome) => {
    if (!canAnswer) return;
    answer(visit, outcome, ANSWER_MESSAGE[outcome]).then(onAnswered);
  };

  return (
    <>
      <OverdueVisitsBanner
        count={visits.length}
        canAnswer={canAnswer}
        onOpen={() => setIsPanelOpen(true)}
      />

      <OverdueVisitsPanel
        visits={visits}
        open={isPanelOpen && !rescheduling}
        canAnswer={canAnswer}
        answeringId={answeringId}
        onClose={() => setIsPanelOpen(false)}
        onAnswer={handleAnswer}
        // Remarcar troca o painel pelo modal (mesmo padrão de `useVisitActions`:
        // um overlay por vez). Fechado o modal, o painel volta com o resto da
        // fila — o vendedor não perde o lugar onde estava.
        onReschedule={(visit) => canAnswer && setRescheduling(visit)}
      />

      {rescheduling && (
        <RescheduleVisitModal
          item={rescheduling}
          open
          onOpenChange={(open) => !open && setRescheduling(null)}
          onDone={() => {
            setRescheduling(null);
            refetch();
            onAnswered();
          }}
        />
      )}
    </>
  );
}
