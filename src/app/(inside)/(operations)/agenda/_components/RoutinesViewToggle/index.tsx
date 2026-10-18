"use client";

import { ToggleGroup, ToggleOption } from "@/components/ToggleGroup";
import { LayoutGrid, List } from "lucide-react";
import { RoutineViewMode } from "../../useRoutines";

interface Props {
  value: RoutineViewMode;
  onChange: (mode: RoutineViewMode) => void;
}

const OPTIONS: ToggleOption<RoutineViewMode>[] = [
  { value: "kanban", label: "Kanban", icon: LayoutGrid },
  { value: "list", label: "Lista", icon: List },
];

// Alterna entre a grade por dia (kanban) e a lista de visitas.
export function RoutinesViewToggle({ value, onChange }: Props) {
  return (
    <ToggleGroup
      aria-label="Modo de exibição"
      data-tour="routines-view-toggle"
      options={OPTIONS}
      value={value}
      onChange={onChange}
    />
  );
}
