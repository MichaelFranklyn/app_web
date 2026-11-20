"use client";

import { Tooltip } from "@/components/Tooltip";
import type { ReactElement } from "react";

import { FactoryScoreChip } from "../../utils";
import { FactoryScoreTooltip } from "../FactoryScoreTooltip";

interface Props {
  chips: FactoryScoreChip[];
  /** Cabeçalho do painel (ex.: por que o escritório está na visita). */
  title?: string;
  /** O selo que abre o tooltip; precisa repassar ref (Badge.Root repassa). */
  children: ReactElement;
}

/**
 * O tooltip de score de Montar semana em volta de um selo qualquer: a
 * fábrica, o escritório, o score e o motivo da visita. Sem fábrica com score,
 * o selo fica como está. Abre no mouse e no foco; no toque, não (o Tooltip
 * do DS não abre no toque).
 */
export function FactoryScoreHint({ chips, title, children }: Props) {
  if (chips.length === 0) return children;
  return (
    <Tooltip
      content={<FactoryScoreTooltip chips={chips} title={title} />}
      panel
    >
      {children}
    </Tooltip>
  );
}
