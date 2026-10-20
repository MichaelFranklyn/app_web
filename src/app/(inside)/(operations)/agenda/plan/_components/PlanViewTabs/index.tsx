"use client";

import { Responsive } from "@/components/Responsive";
import { Tabs } from "@/components/Tabs";

export type PlanView = "clients" | "week";

interface Props {
  view: PlanView;
  onViewChange: (view: PlanView) => void;
  /** Quantos estão escolhidos — vai no rótulo de "Sua semana". */
  chosen: number;
}

/**
 * No celular e no tablet não cabe a lista ao lado do painel: as duas metades
 * da tela viram abas. No desktop as duas aparecem juntas e as abas somem.
 */
export function PlanViewTabs({ view, onViewChange, chosen }: Props) {
  return (
    <Responsive.Hide from="desktop">
      <Tabs.Root
        value={view}
        onValueChange={(value) => onViewChange(value as PlanView)}
      >
        <Tabs.List aria-label="O que ver">
          <Tabs.Item value="clients">Clientes</Tabs.Item>
          <Tabs.Item value="week">
            Sua semana{chosen > 0 ? ` (${chosen})` : ""}
          </Tabs.Item>
        </Tabs.List>
      </Tabs.Root>
    </Responsive.Hide>
  );
}
