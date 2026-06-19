"use client";

import { Card } from "@/components/Card";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Title } from "@/components/Title";
import { SummaryCardProps } from "./interface";

export function SummaryCard({ lastVisitDate, cnae, cnaeDescription }: SummaryCardProps) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title
          size="sm"
          weight="semibold"
          className="inline-flex items-center gap-6"
        >
          Resumo do Cliente
          <HelpTooltip
            label="Sobre o resumo"
            content="Indicadores rápidos do cliente: data da última visita e a classificação de atividade (CNAE)."
          />
        </Card.Header.Title>
      </Card.Header>
      <Card.Body padding="compact">
        <Card.Item
          variant="stat"
          label="Última visita"
          value={lastVisitDate}
        />
        <Card.Item
          variant="stat"
          bordered={false}
          className="flex-col items-start gap-4"
        >
          <Card.Item.Label>CNAE</Card.Item.Label>
          <div className="flex flex-col gap-2">
            <Title variant="heading-sm">{cnae || "—"}</Title>
            {cnaeDescription && (
              <Title
                variant="body-xs"
                color="muted"
                className="leading-snug break-words"
              >
                {cnaeDescription}
              </Title>
            )}
          </div>
        </Card.Item>
      </Card.Body>
    </Card.Root>
  );
}
