import { EmptyState } from "@/components/EmptyState";
import { CalendarX } from "lucide-react";

import { emptyFilterHint } from "../../utils";

interface Props {
  canSelectSeller: boolean;
  title?: string;
}

/**
 * O recorte sem dado nenhum, dito uma vez só — no lugar de KPIs zerados,
 * gráfico "Sem dados" e tabela vazia com cabeçalho (crítica dos Relatórios,
 * 20/11/2026), como já fazem o Dashboard e o Desempenho.
 */
export function ReportEmpty({
  canSelectSeller,
  title = "Nada neste período",
}: Props) {
  return (
    <EmptyState.Root>
      <EmptyState.Icon>
        <CalendarX size={32} />
      </EmptyState.Icon>
      <EmptyState.Title>{title}</EmptyState.Title>
      <EmptyState.Description>
        {emptyFilterHint(canSelectSeller)}
      </EmptyState.Description>
    </EmptyState.Root>
  );
}
