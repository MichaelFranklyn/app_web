"use client";
import { Drawer } from "@/components/Drawer";

import { Badge } from "@/components/Badges";
import { Title } from "@/components/Title";
import { OverdueVisitRow } from "./OverdueVisitRow";
import { OverdueOutcome, OverdueVisit } from "./interface";

interface Props {
  visits: OverdueVisit[];
  open: boolean;
  canAnswer: boolean;
  /** Id da visita em resposta: trava só o card clicado, não a fila. */
  answeringId: string | null;
  onClose: () => void;
  onAnswer: (visit: OverdueVisit, outcome: OverdueOutcome) => void;
  onReschedule: (visit: OverdueVisit) => void;
}

/**
 * A fila de pendências, num painel lateral sobre a rota do dia.
 *
 * Fora do fluxo da página, ela pode ser tão longa quanto for sem esconder o
 * caminho de hoje: os cards ficam um embaixo do outro e o painel rola. Cada
 * resposta some da fila na hora (o card é otimista), então o painel encurta
 * sozinho até acabar.
 */
export function OverdueVisitsPanel({
  visits,
  open,
  canAnswer,
  answeringId,
  onClose,
  onAnswer,
  onReschedule,
}: Props) {
  return (
    <Drawer.Root
      open={open}
      onClose={onClose}
      label="Visitas sem resposta"
      // Fechado, o painel não existe: manter a fila montada fora da tela
      // deixaria os botões de resposta alcançáveis por teclado e pelo leitor de
      // tela sobre a rota do dia, além de renderizar N cards que ninguém vê.
      unmountOnClose
    >
      <Drawer.Header>
        <Title variant="heading-sm">Visitas sem resposta</Title>
        <div className="mt-6">
          <Badge.Root color="amber" appearance="tinted">
            <Badge.Text>
              {visits.length === 1
                ? "1 em aberto"
                : `${visits.length} em aberto`}
            </Badge.Text>
          </Badge.Root>
        </div>
      </Drawer.Header>

      <Drawer.Body className="gap-12">
        <Title variant="body-sm" color="muted">
          {canAnswer
            ? "Estas visitas foram planejadas para dias que já passaram e ficaram sem resposta. Diga o que houve em cada uma — é assim que o sistema sabe quando voltar a esse cliente."
            : "Estas visitas ficaram sem resposta. Só o vendedor pode registrar o que aconteceu."}
        </Title>

        {visits.map((visit) => (
          <OverdueVisitRow
            key={visit.id}
            visit={visit}
            isAnswering={answeringId === visit.id}
            onAnswer={(outcome) => onAnswer(visit, outcome)}
            onReschedule={() => onReschedule(visit)}
          />
        ))}
      </Drawer.Body>
    </Drawer.Root>
  );
}
