"use client";

import { Tabs } from "@/components/Tabs";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { PortalSentOrdersSummary } from "../../../interface";
import { SentOrdersTab, sentOrdersHref } from "../../utils";

interface SentOrdersFilterProps {
  token: string;
  tab: SentOrdersTab;
  /** A busca aberta: trocar de aba mantém o que foi digitado. */
  search?: string;
  /** Para as contagens nas abas; nulo = abas sem número. */
  summary: PortalSentOrdersSummary | null;
}

const tabCounts = (summary: PortalSentOrdersSummary | null) =>
  summary
    ? {
        todos: summary.total,
        pedidos: summary.ordered,
        orcamentos: summary.total - summary.ordered,
      }
    : null;

const TABS: { value: SentOrdersTab; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pedidos", label: "Pedidos feitos" },
  { value: "orcamentos", label: "Orçamentos" },
];

/**
 * Pedidos feitos e orçamentos moram na mesma lista; a faixa recorta. O recorte
 * vai na URL (`?tipo=`) — a lista é do servidor, e voltar do detalhe mantém a
 * aba. Trocar de aba volta para a página 1 e mantém a busca.
 */
export function SentOrdersFilter({
  token,
  tab,
  search = "",
  summary,
}: SentOrdersFilterProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const counts = tabCounts(summary);

  return (
    <Tabs.Filter
      aria-label="Mostrar pedidos ou orçamentos"
      value={tab}
      onValueChange={(value) =>
        startTransition(() =>
          router.push(sentOrdersHref(token, 1, value as SentOrdersTab, search))
        )
      }
    >
      {TABS.map(({ value, label }) => (
        <Tabs.FilterItem key={value} value={value}>
          {counts ? `${label} (${counts[value]})` : label}
        </Tabs.FilterItem>
      ))}
    </Tabs.Filter>
  );
}
