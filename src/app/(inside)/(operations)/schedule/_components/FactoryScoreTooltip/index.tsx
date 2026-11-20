"use client";

import { Badge } from "@/components/Badges";
import { Dot } from "@/components/Dot";
import { Emphasis } from "@/components/Emphasis";
import { Title } from "@/components/Title";
import { TooltipPanel } from "@/components/TooltipPanel";

import { FactoryScoreChip } from "../../utils";

interface Props {
  chips: FactoryScoreChip[];
  /** Cabeçalho da lista (o "+N"); um selo só não tem. */
  title?: string;
}

/**
 * O que aparece ao passar o mouse num selo de score: a fábrica, o nível e o
 * motivo da visita por ela — o que mais pesa no score dela. O "+N" mostra o
 * mesmo bloco para cada fábrica que sobrou, em lista. Só partes do score:
 * nada de comissão ou preço de outro escritório.
 */
export function FactoryScoreTooltip({ chips, title }: Props) {
  const blocks = chips.map(({ key, name, office, score, level, reason }) => (
    // Um filho só no painel: o `divide-y` dele não traça entre a fábrica e o
    // motivo, que são um bloco; o traço fica entre uma fábrica e outra.
    <div key={key}>
      <TooltipPanel.Header
        aside={
          // O número na cor da faixa, como o selo que abriu o tooltip.
          <Badge.Root
            color={level.tone}
            appearance="tinted"
            className="shrink-0"
          >
            <Badge.Text>{score}</Badge.Text>
          </Badge.Root>
        }
      >
        <div className="flex min-w-0 items-center gap-6">
          <Dot.Root
            color={level.tone}
            size="md"
            pulse={false}
            intensity="solid"
          />
          <div className="flex min-w-0 flex-col">
            <Title variant="label" weight="semibold">
              {name}
            </Title>
            {office && (
              <Title variant="micro" color="muted">
                {office} · {level.label}
              </Title>
            )}
          </div>
        </div>
      </TooltipPanel.Header>

      <TooltipPanel.Section className="gap-4 pt-0">
        <Title variant="micro" color="muted">
          Motivo da visita
        </Title>
        <Title variant="body-sm">
          {reason ? (
            <>
              <Emphasis>{reason.short}</Emphasis> — {reason.why}
            </>
          ) : (
            "Sem detalhe do score desta fábrica ainda."
          )}
        </Title>
      </TooltipPanel.Section>
    </div>
  ));

  if (!title)
    return <TooltipPanel.Root width={280}>{blocks}</TooltipPanel.Root>;

  return (
    <TooltipPanel.Root width={280}>
      <TooltipPanel.Header>{title}</TooltipPanel.Header>
      {/* Cliente com muitas fábricas: a lista rola por dentro, com teto na
          altura que sobra na tela — o título e a seta ficam no lugar. */}
      <div className="flex max-h-[min(360px,calc(var(--radix-tooltip-content-available-height)-60px))] flex-col divide-y divide-(--border) overflow-y-auto">
        {blocks}
      </div>
    </TooltipPanel.Root>
  );
}
