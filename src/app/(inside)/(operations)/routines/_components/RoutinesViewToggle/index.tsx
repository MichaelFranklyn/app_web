"use client";

import { ToggleGroup, ToggleOption } from "@/components/ToggleGroup";
import { LayoutGrid, List, Radar } from "lucide-react";
import { RoutineViewMode } from "../../useRoutines";

interface Props {
  value: RoutineViewMode;
  onChange: (mode: RoutineViewMode) => void;
}

const OPTIONS: ToggleOption<RoutineViewMode>[] = [
  { value: "kanban", label: "Kanban", icon: LayoutGrid },
  { value: "list", label: "Lista", icon: List },
  { value: "radar", label: "Radar", icon: Radar },
];

// Alterna entre a grade por dia (kanban), a lista de visitas e o radar.
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
