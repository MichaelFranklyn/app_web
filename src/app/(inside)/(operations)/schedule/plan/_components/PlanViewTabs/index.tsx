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
      {/* Tabs.Filter (botões com aria-pressed): as duas metades da tela ficam
          fora de um Tabs.Content, e a aba do Radix apontaria o aria-controls
          para um painel que não existe. */}
      {/* Sem a margem de baixo do Tabs.Filter: o gap da página já separa a
          aba da busca, e as duas somadas abriam um buraco no celular. */}
      <Tabs.Filter
        aria-label="O que ver"
        className="mb-0"
        value={view}
        onValueChange={(value) => onViewChange(value as PlanView)}
      >
        <Tabs.FilterItem value="clients">Clientes</Tabs.FilterItem>
        <Tabs.FilterItem value="week">
          Sua semana{chosen > 0 ? ` (${chosen})` : ""}
        </Tabs.FilterItem>
      </Tabs.Filter>
    </Responsive.Hide>
  );
}
