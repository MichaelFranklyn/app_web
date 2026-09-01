"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { CalendarOff, CalendarPlus } from "lucide-react";
import { useState } from "react";

import { buildDayOffConfirmation } from "./utils";

interface Props {
  /** Data ISO do dia da coluna. */
  date: string;
  /** Já está marcado como não trabalhado? Decide marcar × desmarcar. */
  isDayOff: boolean;
  /** Paradas pendentes do dia — é o que será realocado ao marcar. */
  pendingCount: number;
  onMark: (date: string) => Promise<void>;
  onUnmark: (date: string) => Promise<void>;
}

/** "Não vou trabalhar neste dia" — e o caminho de volta. */
export function DayOffButton({
  date,
  isDayOff,
  pendingCount,
  onMark,
  onUnmark,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { title, description, confirmLabel } = buildDayOffConfirmation(
    isDayOff,
    pendingCount
  );

  return (
    <>
      <Button.Root
        appearance="tinted"
        color="neutral"
        size="sm"
        fullWidth
        noUppercase
        onClick={() => setIsOpen(true)}
      >
        <Button.Icon icon={isDayOff ? CalendarPlus : CalendarOff} />
        <Button.Title>
          {isDayOff ? "Voltar a trabalhar" : "Não vou trabalhar"}
        </Button.Title>
      </Button.Root>

      <ConfirmModal
        open={isOpen}
        onOpenChange={setIsOpen}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        confirmColor={isDayOff ? "amber" : "red"}
        onConfirm={() => (isDayOff ? onUnmark(date) : onMark(date))}
      />
    </>
  );
}
