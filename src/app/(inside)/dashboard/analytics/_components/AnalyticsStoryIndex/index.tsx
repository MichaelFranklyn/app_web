"use client";

import { Card } from "@/components/Card";
import { Title } from "@/components/Title";

import { ANALYTICS_STORY } from "../../storyParts";

/**
 * Roteiro da página: as sete perguntas, na ordem em que são respondidas.
 *
 * A página é longa e cada gráfico responde uma coisa pequena. Sem o roteiro, quem
 * abre vê trinta cartões e não sabe onde começa nem onde termina — com ele, sabe
 * o que vai ler, em que ordem, e pode pular direto para a pergunta que veio
 * buscar.
 */
export function AnalyticsStoryIndex() {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="semibold">
          O que você vai ver, nesta ordem
        </Card.Header.Title>
        <Card.Header.Description>
          Cada parte responde uma pergunta e prepara a seguinte. Clique para ir
          direto a uma delas.
        </Card.Header.Description>
      </Card.Header>
      <Card.Body>
        <ol className="desktop:grid-cols-2 grid gap-8">
          {ANALYTICS_STORY.map((part, index) => (
            <li key={part.id}>
              <a
                href={`#${part.id}`}
                className="flex gap-8 rounded p-8 transition-colors hover:bg-(--bg3)"
              >
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
                    {part.label}
                  </Title>
                  <Title variant="body-xs" color="muted">
                    {part.question}
                  </Title>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </Card.Body>
    </Card.Root>
  );
}
