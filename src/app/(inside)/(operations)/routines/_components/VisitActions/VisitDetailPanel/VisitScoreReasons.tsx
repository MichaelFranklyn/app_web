"use client";
import { Emphasis } from "@/components/Emphasis";
import { Dot } from "@/components/Dot";
import { Card } from "@/components/Card";

import { Badge } from "@/components/Badges";
import { Title } from "@/components/Title";
import { VisitScoreReason } from "../../../utils";

interface Props {
  reasons: VisitScoreReason[];
}

// Quantos fatores aparecem por empresa. Os cinco de uma vez viram parede de
// texto; a lista já vem ordenada pelo que mais empurrou o score, então os três
// primeiros são o que de fato explica a visita.
const REASONS_SHOWN = 3;

/**
 * "Por que esta visita" — o motivo do score de cada empresa em foco.
 *
 * O painel dizia QUANDO e ONDE, mas não POR QUE o sistema mandou o vendedor
 * até ali. Cada bloco nomeia a fábrica, mostra a faixa (Urgente/Atenção…) com o
 * número e lista os fatores em linguagem direta ("O estoque do cliente está
 * perto de acabar"), para a decisão do sistema ser conferível na hora.
 */
export function VisitScoreReasons({ reasons }: Props) {
  if (reasons.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      <Title variant="micro" color="muted">
        Por que esta visita
      </Title>

      <div className="flex flex-col gap-10">
        {reasons.map(({ key, factoryLabel, explanation }) => (
          <Card.Root key={key} inset tone="transparent">
            <Card.Body padding="sm" className="gap-6">
              <div className="flex items-start justify-between gap-8">
                <Title variant="body-sm" className="min-w-0 truncate">
                  {factoryLabel}
                </Title>
                <Badge.Root
                  color={explanation.level.tone}
                  appearance="tinted"
                  size="sm"
                >
                  <Badge.Dot />
                  <Badge.Text>
                    {explanation.level.label} · {explanation.total.toFixed(0)}
                  </Badge.Text>
                </Badge.Root>
              </div>

              {explanation.reasons.length === 0 ? (
                <Title variant="body-xs" color="muted">
                  {explanation.level.summary}
                </Title>
              ) : (
                <div className="flex flex-col gap-6">
                  {explanation.reasons.slice(0, REASONS_SHOWN).map((reason) => (
                    <div key={reason.key} className="flex gap-6">
                      <Dot.Root
                        color={reason.tone}
                        pulse={false}
                        className="mt-[6px] opacity-100"
                      />
                      <Title variant="body-xs" color="secondary">
                        <Emphasis>{reason.label}</Emphasis> — {reason.why}
                      </Title>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card.Root>
        ))}
      </div>
    </div>
  );
}
