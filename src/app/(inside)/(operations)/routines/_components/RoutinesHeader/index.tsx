"use client";

import { PanelHeader } from "@/components/PanelHeader";

import { RoutineSellerOption } from "../../interface";
import { formatWeekRange, getIsoWeekNumber } from "../../utils";
import { WeekNavigator } from "../WeekNavigator";

interface Props {
  weekStart: string;
  sellers?: RoutineSellerOption[];
  selectedSellerId?: string | null;
  onSelectSeller?: (id: string) => void;
  onSelectDate: (weekStartIso: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
}

/**
 * "Agenda": o título com a semana e, embaixo, de quem e qual semana — com a
 * porta principal, "Montar semana", na mesma linha (ver `WeekNavigator`).
 *
 * "Marcar visita" e o planejador de viagem saíram daqui em 18/10/2026: marcar
 * visita mora em Montar semana, junto das visitas marcadas, e a viagem perdeu
 * o sentido com o vendedor montando a própria semana.
 */
export function RoutinesHeader({
  weekStart,
  selectedSellerId,
  ...navigation
}: Props) {
  const description = `Semana ${getIsoWeekNumber(weekStart)} · ${formatWeekRange(weekStart)}`;

  return (
    <div className="flex flex-col gap-12">
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Title>Agenda</PanelHeader.Title>
            <PanelHeader.Description>{description}</PanelHeader.Description>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>
      <WeekNavigator
        weekStart={weekStart}
        selectedSellerId={selectedSellerId}
        {...navigation}
      />
    </div>
  );
}
