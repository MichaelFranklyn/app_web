"use client";

import { Badge } from "@/components/Badges";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format/date";
import { ChevronRight } from "lucide-react";
import { FactoryOrderSummary } from "../../../interface";
import { formatCurrency } from "../../../utils";
import { factoryName } from "@/utils/company";

interface Props {
  summary: FactoryOrderSummary;
  onSelect: (summary: FactoryOrderSummary) => void;
}

/** Relação de compra com aquela fábrica, numa frase que o vendedor lê de relance. */
function relationship(summary: FactoryOrderSummary): {
  label: string;
  color: "neutral" | "green";
} {
  if (summary.totalOrders === 0) {
    return { label: "Nunca comprou", color: "neutral" };
  }
  return {
    label: `Última em ${formatDate(summary.lastOrderDate)}`,
    color: "green",
  };
}

export function FactoryOrderCard({ summary, onSelect }: Props) {
  const name = factoryName(summary.factory);
  const rel = relationship(summary);
  const plural = summary.totalOrders !== 1 ? "s" : "";

  return (
    <button
      type="button"
      onClick={() => onSelect(summary)}
      aria-label={`Ver os pedidos de ${name}`}
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
        <Badge.Root color={rel.color} appearance="tinted">
          <Badge.Text>{rel.label}</Badge.Text>
        </Badge.Root>
      </div>

      <div className="flex items-center justify-between gap-8">
        <div className="flex min-w-0 flex-col gap-2">
          <Title variant="body-sm" color="secondary">
            {summary.totalOrders} pedido{plural}
          </Title>
          <Title variant="body-sm" weight="semibold">
            {formatCurrency(summary.totalAmount)}
          </Title>
        </div>
        <div className="flex items-center gap-4">
          <Title variant="micro" color="secondary">
            Ver pedidos
          </Title>
          <ChevronRight size={14} className="text-(--muted)" />
        </div>
      </div>
    </button>
  );
}
