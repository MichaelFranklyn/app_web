"use client";

import { Badge } from "@/components/Badges";
import { Title } from "@/components/Title";
import { Tooltip } from "@/components/Tooltip";

import { factoryScoreText, FactoryScoreChip } from "../../utils";
import { FactoryScoreBadge } from "../FactoryScoreBadge";
import { FactoryScoreTooltip } from "../../../_components/FactoryScoreTooltip";

interface Props {
  clientName: string;
  chips: FactoryScoreChip[];
  rest: FactoryScoreChip[];
}

/**
 * As outras fábricas do cliente — a mais urgente já está ao lado do nome —,
 * cada uma com o score e o escritório entre parênteses (a daqui também).
 * Só o score: nunca comissão ou preço.
 */
export function FactoryScoreBadges({ clientName, chips, rest }: Props) {
  if (chips.length === 0) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-6"
      aria-label={`Outras fábricas de ${clientName}`}
    >
      <Title variant="body-xs" color="muted" as="span">
        Outras fábricas:
      </Title>
      {chips.map((chip) => (
        <FactoryScoreBadge key={chip.key} chip={chip}>
          {factoryScoreText(chip)}
        </FactoryScoreBadge>
      ))}
      {rest.length > 0 && (
        // O mesmo painel dos outros selos, com a lista das que sobraram.
        <Tooltip
          content={
            <FactoryScoreTooltip
              chips={rest}
              title={
                rest.length === 1
                  ? "Mais 1 fábrica"
                  : `Mais ${rest.length} fábricas`
              }
            />
          }
          panel
        >
          <Badge.Root
            color="neutral"
            appearance="tinted"
            size="sm"
            className="max-desktop:w-full max-desktop:justify-center max-w-full cursor-help"
            aria-label={`Mais ${rest.length}: ${rest.map(factoryScoreText).join(", ")}`}
          >
            <Badge.Text>+{rest.length}</Badge.Text>
          </Badge.Root>
        </Tooltip>
      )}
    </div>
  );
}
