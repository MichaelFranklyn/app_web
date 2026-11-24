"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { LinkTile } from "@/components/LinkTile";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { ANALYTICS_STORY, storyLabel } from "../../storyParts";

interface Props {
  /** Admin vê a equipe; o vendedor lê os títulos na primeira pessoa. */
  canSelectSeller: boolean;
}

/**
 * Roteiro da página: as sete perguntas, na ordem em que são respondidas.
 *
 * A página é longa e cada gráfico responde uma coisa pequena. Sem o roteiro, quem
 * abre vê trinta cartões e não sabe onde começa nem onde termina — com ele, sabe
 * o que vai ler, em que ordem, e pode pular direto para a pergunta que veio
 * buscar.
 *
 * No celular a lista começa recolhida: aberta, ela ocupava mais de uma tela
 * inteira antes do primeiro gráfico. No desktop fica sempre aberta.
 */
export function AnalyticsStoryIndex({ canSelectSeller }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card.Root data-tour="analytics-story">
      <Card.Header>
        <Card.Header.Title>O que você vai ver, nesta ordem</Card.Header.Title>
        <Card.Header.Description>
          Cada parte responde uma pergunta e prepara a seguinte. Clique para ir
          direto a uma delas.
        </Card.Header.Description>
      </Card.Header>
      <Card.Body>
        <ol
          id="analytics-story-list"
          className={cn(
            "desktop:grid-cols-2 desktop:grid gap-8",
            isExpanded ? "grid" : "hidden"
          )}
        >
          {ANALYTICS_STORY.map((part, index) => (
            <li key={part.id}>
              <LinkTile href={`#${part.id}`}>
                <Title
                  variant="body-sm"
                  weight="semibold"
                  color="muted"
                  className="shrink-0"
                >
                  {index + 1}.
                </Title>
                <span className="min-w-0">
                  <Title variant="body-sm" weight="semibold">
                    {storyLabel(part, canSelectSeller)}
                  </Title>
                  <Title variant="body-xs" color="muted">
                    {part.question}
                  </Title>
                </span>
              </LinkTile>
            </li>
          ))}
        </ol>
        <Button.Root
          appearance="outline"
          color="neutral"
          size="md"
          fullWidth
          className="desktop:hidden"
          aria-expanded={isExpanded}
          aria-controls="analytics-story-list"
          onClick={() => setIsExpanded((current) => !current)}
        >
          <Button.Title>
            {isExpanded
              ? "Esconder as partes"
              : `Ver as ${ANALYTICS_STORY.length} partes`}
          </Button.Title>
          <Button.Icon
            icon={ChevronDown}
            className={cn(
              "transition-transform motion-reduce:transition-none",
              isExpanded && "rotate-180"
            )}
          />
        </Button.Root>
      </Card.Body>
    </Card.Root>
  );
}
