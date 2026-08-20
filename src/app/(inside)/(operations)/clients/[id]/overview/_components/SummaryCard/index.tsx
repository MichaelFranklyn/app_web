"use client";

import { Card } from "@/components/Card";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Loading } from "@/components/Loading";
import { Title } from "@/components/Title";
import { SummaryCardProps } from "./interface";

export function SummaryCard({
  lastVisitDate,
  lastVisitLoading = false,
  cnae,
  cnaeDescription,
  networkName,
  segmentName,
}: SummaryCardProps) {
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
            content="Indicadores rápidos do cliente: última visita, como a sua empresa o classifica (rede e segmento) e a atividade declarada na Receita (CNAE)."
          />
        </Card.Header.Title>
      </Card.Header>
      <Card.Body padding="compact">
        {/* Enquanto a consulta dos vínculos não volta, um traço aqui diria
            "nunca visitado" — que é uma resposta, e errada. */}
        {lastVisitLoading ? (
          <Card.Item variant="stat">
            <Card.Item.Label>Última visita</Card.Item.Label>
            <Loading.Skeleton className="h-[14px] w-20" />
          </Card.Item>
        ) : (
          <Card.Item
            variant="stat"
            label="Última visita"
            value={lastVisitDate}
          />
        )}
        {/* Classificação da SUA empresa — o CNAE abaixo é o da Receita. */}
        <Card.Item variant="stat" label="Rede" value={networkName ?? "—"} />
        <Card.Item variant="stat" label="Segmento" value={segmentName ?? "—"} />
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
