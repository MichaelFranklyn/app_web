"use client";

import { EmptyState } from "@/components/EmptyState";
import { CalendarPlus } from "lucide-react";

import { PlanWeekLink } from "../PlanWeekLink";

interface Props {
  weekStart: string;
  sellerId: string | null;
}

/**
 * A semana em branco, com o próximo passo à mão.
 *
 * Sete colunas vazias não dizem nada a quem abre a agenda pela primeira vez —
 * parece que o sistema não carregou. O aviso diz o que aconteceu (não há nada
 * marcado) e o que fazer (montar a semana), e a grade continua logo abaixo
 * para quem prefere pôr um compromisso à mão num dia.
 */
export function EmptyWeekNote({ weekStart, sellerId }: Props) {
  return (
    <EmptyState.Root className="py-24" data-testid="agenda-empty-week">
      <EmptyState.Icon>
        <CalendarPlus />
      </EmptyState.Icon>
      <EmptyState.Title>Nada marcado nesta semana</EmptyState.Title>
      <EmptyState.Description>
        Monte a semana: escolha os clientes que quer ver e o sistema traça o
        caminho de cada dia. Se preferir, use o “+” de um dia para marcar uma
        visita ou ligação à mão.
      </EmptyState.Description>
      <EmptyState.Actions>
        <PlanWeekLink weekStart={weekStart} sellerId={sellerId} />
      </EmptyState.Actions>
    </EmptyState.Root>
  );
}
