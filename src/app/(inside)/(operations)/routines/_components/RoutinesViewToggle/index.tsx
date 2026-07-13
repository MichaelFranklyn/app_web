"use client";

import { Button } from "@/components/Button";
import { LayoutGrid, List } from "lucide-react";
import { RoutineViewMode } from "../../useRoutines";

interface Props {
  value: RoutineViewMode;
  onChange: (mode: RoutineViewMode) => void;
}

const OPTIONS: {
  value: RoutineViewMode;
  label: string;
  icon: typeof LayoutGrid;
}[] = [
  { value: "kanban", label: "Kanban", icon: LayoutGrid },
  { value: "list", label: "Lista", icon: List },
];

// Alterna entre a grade por dia (kanban) e a lista de visitas. Espelha o
// visual dos botões de período: o modo ativo fica âmbar/tinted, o outro outline.
export function RoutinesViewToggle({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-4" data-tour="routines-view-toggle">
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <Button.Root
            key={opt.value}
            type="button"
            appearance={active ? "tinted" : "outline"}
            color={active ? "amber" : "neutral"}
            size="sm"
            noUppercase
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
          >
            <Button.Icon icon={opt.icon} />
            <Button.Title>{opt.label}</Button.Title>
          </Button.Root>
        );
      })}
    </div>
  );
}
