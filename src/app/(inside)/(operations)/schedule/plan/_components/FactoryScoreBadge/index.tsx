"use client";

import { Badge } from "@/components/Badges";
import { Tooltip } from "@/components/Tooltip";
import type { ReactNode } from "react";

import { FactoryScoreChip } from "../../utils";
import { FactoryScoreTooltip } from "../../../_components/FactoryScoreTooltip";

interface Props {
  chip: FactoryScoreChip;
  children: ReactNode;
}

/**
 * Um selo de score na cor da faixa; no celular toma a linha toda. O mouse em cima mostra a fábrica, o
 * escritório e o motivo da visita por ela.
 */
export function FactoryScoreBadge({ chip, children }: Props) {
  return (
    <Tooltip content={<FactoryScoreTooltip chips={[chip]} />} panel>
      <Badge.Root
        color={chip.level.tone}
        appearance="tinted"
        size="sm"
        className="max-desktop:w-full max-desktop:justify-center max-w-full cursor-help"
      >
        <Badge.Text>{children}</Badge.Text>
      </Badge.Root>
    </Tooltip>
  );
}
