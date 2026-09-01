"use client";

import { Title } from "@/components/Title";
import { Plus } from "lucide-react";
import { useState } from "react";

import { RoutineCapacity, VisitScheduleDay } from "../../interface";
import { AddVisitModal } from "./AddVisitModal";

interface Props {
  /** Dia existente na rotina; null quando o dia ainda não tem rota. */
  day: VisitScheduleDay | null;
  /** Data ISO do dia (para criá-lo quando ainda não existe). */
  date: string;
  /** VisitSchedule da semana (para criar o dia quando ainda não existe). */
  scheduleId: string;
  /** Próximo dia útil da semana (para "agendar no dia seguinte"); null se ele não tiver rota. */
  nextDay: VisitScheduleDay | null;
  sellerId: string | null;
  capacity: RoutineCapacity;
  onChanged: () => void;
}

// Card com "+" ao centro para agendar manualmente uma visita neste dia. Também
// funciona em dias sem rota: cria o dia e adiciona a primeira visita.
export function AddVisitCard({
  day,
  date,
  scheduleId,
  nextDay,
  sellerId,
  capacity,
  onChanged,
}: Props) {
  const [open, setOpen] = useState(false);

  // Sem vendedor resolvido não há carteira para agendar.
  if (!sellerId) return null;

  const label = day ? "Adicionar visita" : "Adicionar visita manual";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={label}
        aria-label={label}
        className="mt-6 flex w-full cursor-pointer items-center justify-center gap-4 rounded-(--radius-md) border border-dashed border-(--border2) py-10 text-(--muted) transition-colors hover:border-(--amber) hover:text-(--amber)"
      >
        <Plus size={16} strokeWidth={2.5} />
        <Title variant="micro" weight="medium" className="text-inherit">
          {label}
        </Title>
      </button>

      <AddVisitModal
        open={open}
        onOpenChange={setOpen}
        day={day}
        date={date}
        scheduleId={scheduleId}
        nextDay={nextDay}
        sellerId={sellerId}
        capacity={capacity}
        onDone={onChanged}
      />
    </>
  );
}
