import { cn } from "@/lib/utils";
import React from "react";

/**
 * Corpo rolável do painel. Os filhos não encolhem (`*:shrink-0`): sem isso, um
 * filho com `overflow-hidden` (o Card) perde o piso de altura e a coluna flex
 * espreme a lista inteira na altura da tela — com 20 visitas, cada card virava
 * uma faixa de 28px — em vez de rolar.
 */
export function Body({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-16 overflow-y-auto px-20 py-16 *:shrink-0",
        className
      )}
      {...props}
    />
  );
}
