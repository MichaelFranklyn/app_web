"use client";

import { Badge } from "@/components/Badges";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { FactoryStockSummary } from "../../../interface";
import { factoryName } from "@/utils/company";

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
    const plural = summary.stockedOut !== 1 ? "s" : "";
    return { label: `${summary.stockedOut} zerado${plural}`, color: "red" };
  }
  if (summary.critical > 0) {
    const plural = summary.critical !== 1 ? "s" : "";
    return { label: `${summary.critical} crítico${plural}`, color: "amber" };
  }
  return { label: "Estoque em dia", color: "green" };
}

export function FactoryStockCard({ summary, onSelect }: Props) {
  const name = factoryName(summary.factory);
  const sit = situation(summary);
  const plural = summary.totalProducts !== 1 ? "s" : "";

  return (
    <button
      type="button"
      onClick={() => onSelect(summary)}
      aria-label={`Ver os produtos de ${name}`}
      className={cn(
        "flex w-full cursor-pointer flex-col gap-10 rounded-(--r-md) border border-(--border)",
        "bg-(--bg2) p-16 text-left transition-colors hover:bg-(--bg3)",
        "focus-visible:outline-2 focus-visible:outline-(--amber)"
      )}
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
          {summary.totalProducts} produto{plural} acompanhado{plural}
        </Title>
        <div className="flex items-center gap-4">
          <Title variant="micro" color="secondary">
            Ver produtos
          </Title>
          <ChevronRight size={14} className="text-(--muted)" />
        </div>
      </div>
    </button>
  );
}
