"use client";
import { Card } from "@/components/Card";

import { Badge } from "@/components/Badges";
import { Title } from "@/components/Title";
import { ChevronRight } from "lucide-react";
import { FactoryStockSummary } from "../../../interface";
import { factoryName } from "@/utils/company";
import { plural } from "@/utils/format/plural";
import { ICON_SIZE } from "@/components/Icon";

interface Props {
  summary: FactoryStockSummary;
  onSelect: (summary: FactoryStockSummary) => void;
}

/** Situação do estoque numa fábrica, em uma frase que o vendedor lê de relance. */
function situation(summary: FactoryStockSummary): {
  label: string;
  color: "red" | "amber" | "green";
} {
  if (summary.stockedOut > 0) {
    return {
      label: plural(summary.stockedOut, "zerado", "zerados"),
      color: "red",
    };
  }
  if (summary.critical > 0) {
    return {
      label: plural(summary.critical, "crítico", "críticos"),
      color: "amber",
    };
  }
  return { label: "Estoque em dia", color: "green" };
}

export function FactoryStockCard({ summary, onSelect }: Props) {
  const name = factoryName(summary.factory);
  const sit = situation(summary);

  return (
    <Card.Button
      onClick={() => onSelect(summary)}
      aria-label={`Ver os produtos de ${name}`}
    >
      <div className="flex items-start justify-between gap-8">
        <Title variant="body" weight="semibold" className="truncate">
          {name}
        </Title>
        <Badge.Root color={sit.color} appearance="tinted">
          <Badge.Text>{sit.label}</Badge.Text>
        </Badge.Root>
      </div>

      <div className="flex items-center justify-between gap-8">
        <Title variant="body-sm" color="secondary">
          {plural(
            summary.totalProducts,
            "produto acompanhado",
            "produtos acompanhados"
          )}
        </Title>
        <div className="flex items-center gap-4">
          <Title variant="micro" color="secondary">
            Ver produtos
          </Title>
          <ChevronRight
            size={ICON_SIZE.sm}
            className="text-(--color-text-muted)"
          />
        </div>
      </div>
    </Card.Button>
  );
}
