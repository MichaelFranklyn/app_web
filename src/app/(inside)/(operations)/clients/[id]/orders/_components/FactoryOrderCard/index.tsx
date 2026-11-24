"use client";
import { Card } from "@/components/Card";

import { Badge } from "@/components/Badges";
import { Title } from "@/components/Title";
import {
  daysBetweenIso,
  formatDate,
  getBrtTodayIso,
} from "@/utils/format/date";
import { ChevronRight } from "lucide-react";
import { FactoryOrderSummary } from "../../../interface";
import { formatCurrency } from "../../../utils";
import { factoryName } from "@/utils/company";

interface Props {
  summary: FactoryOrderSummary;
  onSelect: (summary: FactoryOrderSummary) => void;
}

/** Até aqui a última compra é recente; depois, esfriando; depois, parada. */
const RECENT_DAYS = 45;
const COOLING_DAYS = 90;

/**
 * Relação de compra com aquela fábrica, numa frase que o vendedor lê de
 * relance. A cor diz se o tempo desde a última compra preocupa: sempre verde,
 * a tarja de quem não compra há meio ano parecia a de quem comprou ontem
 * (crítica de 23/11/2026).
 */
function relationship(
  summary: FactoryOrderSummary,
  todayIso: string
): { label: string; color: "neutral" | "green" | "amber" | "red" } {
  if (summary.totalOrders === 0 || !summary.lastOrderDate) {
    return { label: "Nunca comprou", color: "neutral" };
  }
  const days = daysBetweenIso(summary.lastOrderDate, todayIso);
  const color =
    days <= RECENT_DAYS ? "green" : days <= COOLING_DAYS ? "amber" : "red";
  return { label: `Última em ${formatDate(summary.lastOrderDate)}`, color };
}

export function FactoryOrderCard({ summary, onSelect }: Props) {
  const name = factoryName(summary.factory);
  const rel = relationship(summary, getBrtTodayIso());
  const hasOrders = summary.totalOrders > 0;
  const plural = summary.totalOrders !== 1 ? "s" : "";

  return (
    <Card.Button
      onClick={() => onSelect(summary)}
      aria-label={`Ver os pedidos de ${name}`}
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
        {/* Sem pedido não há lista para abrir: a chamada prometia algo vazio. */}
        {hasOrders && (
          <div className="flex items-center gap-4">
            <Title variant="micro" color="secondary">
              Ver pedidos
            </Title>
            <ChevronRight size={14} className="text-(--color-text-muted)" />
          </div>
        )}
      </div>
    </Card.Button>
  );
}
