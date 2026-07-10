"use client";

import { EmptyState } from "@/components/EmptyState";
import { Title } from "@/components/Title";
import { isUrgent } from "@/utils/score";
import { Factory } from "lucide-react";
import { useState } from "react";
import { FactoryVisitScore } from "../../../interface";
import { FactoryScoreCard } from "../FactoryScoreCard";

interface Props {
  scores: FactoryVisitScore[];
  onSelect: (score: FactoryVisitScore) => void;
}

// Um cliente costuma ter dezenas de fábricas. Mostrar todas de uma vez esconde
// as que pedem ação, então as tranquilas ficam atrás de um botão.
const COLLAPSED_CALM = 3;

/** As fábricas do cliente, da mais urgente para a mais tranquila. */
export function FactoryScoreGrid({ scores, onSelect }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (scores.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Icon>
          <Factory size={32} />
        </EmptyState.Icon>
        <EmptyState.Title>Sem score por fábrica</EmptyState.Title>
        <EmptyState.Description>
          Nenhuma fábrica deste cliente tem score calculado ainda.
        </EmptyState.Description>
      </EmptyState.Root>
    );
  }

  const urgent = scores.filter((s) => isUrgent(parseFloat(s.scoreTotal) || 0));
  const calm = scores.filter((s) => !isUrgent(parseFloat(s.scoreTotal) || 0));
  const visibleCalm = expanded ? calm : calm.slice(0, COLLAPSED_CALM);
  const hidden = calm.length - visibleCalm.length;

  return (
    <div className="flex flex-col gap-16">
      <div className="desktop:grid-cols-3 tablet:grid-cols-2 grid grid-cols-1 gap-12">
        {[...urgent, ...visibleCalm].map((score) => (
          <FactoryScoreCard
            key={score.clientFactoryLink?.id ?? score.scoreDate}
            score={score}
            onSelect={onSelect}
          />
        ))}
      </div>

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="cursor-pointer self-center py-8"
        >
          <Title variant="body-sm" color="secondary">
            Ver todas as fábricas ({hidden} sem urgência)
          </Title>
        </button>
      )}
    </div>
  );
}
