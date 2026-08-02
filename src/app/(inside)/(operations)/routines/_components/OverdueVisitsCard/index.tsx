"use client";

import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { useState } from "react";
import { RescheduleVisitModal } from "../VisitActions/RescheduleVisitModal";
import { OverdueVisitRow } from "./OverdueVisitRow";
import { OverdueVisit } from "./interface";
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
 * nunca tivesse sido agendado. Um clique por linha fecha a lacuna. O que ficar
 * sem resposta por uma semana é encerrado pelo job `close_stale_visits`.
 */
export function OverdueVisitsCard({ sellerId, canAnswer, onAnswered }: Props) {
  const { visits, loading, answeringId, answer, refetch } =
    useOverdueVisits(sellerId);
  const [rescheduling, setRescheduling] = useState<OverdueVisit | null>(null);

  // Sem dívida, o card não existe: cobrar nada é ruído na tela de trabalho.
  if (loading || visits.length === 0) return null;

  const handleAnswered = () => {
    onAnswered();
  };

  return (
    <>
      <Card.Root>
        <Card.Header>
          <Card.Header.Title size="sm" weight="bold">
            O que aconteceu nestas visitas?
          </Card.Header.Title>
          <Card.Header.Actions>
            <Badge.Root color="amber" appearance="tinted">
              <Badge.Text>
                {visits.length === 1
                  ? "1 sem resposta"
                  : `${visits.length} sem resposta`}
              </Badge.Text>
            </Badge.Root>
          </Card.Header.Actions>
        </Card.Header>
        <Card.Body padding="compact">
          <Title variant="body-sm" color="muted" className="mb-10">
            {canAnswer
              ? "Estas visitas foram planejadas para dias que já passaram e ficaram sem resposta. Diga o que houve em cada uma — é assim que o sistema sabe quando voltar a esse cliente."
              : "Estas visitas ficaram sem resposta. Só o vendedor pode registrar o que aconteceu."}
          </Title>

          <div className="grid [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))] gap-8">
            {visits.map((visit) => (
              <OverdueVisitRow
                key={visit.id}
                visit={visit}
                isAnswering={answeringId === visit.id}
                onAnswer={(outcome) => {
                  if (!canAnswer) return;
                  const messages = {
                    COMPLETED: "Visita registrada",
                    CLIENT_ABSENT: "Registrado: cliente não estava",
                    NO_TIME: "Registrado: não deu tempo",
                  } as const;
                  answer(visit, outcome, messages[outcome]).then(
                    handleAnswered
                  );
                }}
                onReschedule={() => canAnswer && setRescheduling(visit)}
              />
            ))}
          </div>
        </Card.Body>
      </Card.Root>

      {rescheduling && (
        <RescheduleVisitModal
          item={rescheduling}
          open
          onOpenChange={(open) => !open && setRescheduling(null)}
          onDone={() => {
            setRescheduling(null);
            refetch();
            handleAnswered();
          }}
        />
      )}
    </>
  );
}
