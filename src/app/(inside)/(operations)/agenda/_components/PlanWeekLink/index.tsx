"use client";

import { Button } from "@/components/Button";
import { ListChecks } from "lucide-react";

interface Props {
  weekStart: string;
  sellerId: string | null;
  className?: string;
}

/**
 * A porta para "Montar semana": o vendedor escolhe os clientes e o sistema
 * monta o caminho. Leva junto a semana e o vendedor em tela — a outra tela abre
 * exatamente na agenda que a pessoa estava olhando.
 */
export function PlanWeekLink({ weekStart, sellerId, className }: Props) {
  const params = new URLSearchParams({
    ...(sellerId ? { sellerId } : {}),
    week: weekStart,
  });
  return (
    <Button.Link
      href={`/agenda/plan?${params.toString()}`}
      appearance="solid"
      color="amber"
      size="sm"
      noUppercase
      className={className}
    >
      <Button.Icon icon={ListChecks} />
      <Button.Title>Montar semana</Button.Title>
    </Button.Link>
  );
}
