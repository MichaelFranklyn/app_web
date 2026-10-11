"use client";

import { ToggleGroup } from "@/components/ToggleGroup";

import { PendingSection } from "../../interface";

interface Props {
  section: PendingSection;
  totals: Record<PendingSection, number>;
  onChange: (section: PendingSection) => void;
}

/**
 * Compromissos × Cobranças. Os boletos vencidos têm seção própria para não
 * empurrar visitas e retornos para o fim da lista — sem rebaixar a prioridade
 * de nenhum. A contagem fica no rótulo: a cobrança nunca some de vista.
 */
export function PendingSections({ section, totals, onChange }: Props) {
  return (
    <ToggleGroup
      aria-label="Seção da lista"
      data-tour="pending-sections"
      value={section}
      onChange={onChange}
      options={[
        {
          value: "commitments",
          label: `Compromissos (${totals.commitments})`,
        },
        { value: "charges", label: `Cobranças (${totals.charges})` },
      ]}
    />
  );
}
