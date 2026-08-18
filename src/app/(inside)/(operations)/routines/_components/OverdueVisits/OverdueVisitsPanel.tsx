"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import { X } from "lucide-react";
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
  // Fechado, o painel não existe: manter a fila montada fora da tela deixaria
  // os botões de resposta alcançáveis por teclado e pelo leitor de tela sobre a
  // rota do dia, além de renderizar N cards que ninguém está vendo.
  if (!open) return null;

  return (
    <>
      {/* Backdrop — clicar fora fecha. Mesma faixa de z do painel de visita. */}
      <div
        className="animate-in fade-in fixed inset-0 z-[55] bg-black/30 duration-200"
        onClick={onClose}
        data-testid="overdue-panel-backdrop"
        aria-hidden
      />

      <aside
        role="dialog"
        aria-label="Visitas sem resposta"
        className="animate-in slide-in-from-right fixed top-0 right-0 z-[60] flex h-full w-[420px] max-w-[calc(100vw-32px)] flex-col border-l border-(--border) bg-(--bg) shadow-xl duration-200"
      >
        <div className="flex items-start justify-between gap-8 border-b border-(--border) px-20 py-16">
          <div className="min-w-0">
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
          </div>
          <Button.Root
            appearance="ghost"
            color="neutral"
            size="sm"
            isIconOnly
            label="Fechar"
            onClick={onClose}
          >
            <Button.Icon icon={X} />
          </Button.Root>
        </div>

        <div className="flex flex-1 flex-col gap-12 overflow-y-auto px-20 py-16">
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
        </div>
      </aside>
    </>
  );
}
