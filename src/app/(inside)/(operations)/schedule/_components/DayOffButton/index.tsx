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
  /** Aberto pelo pai (item de menu): sem o botão próprio. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** "Não vou trabalhar neste dia" — e o caminho de volta. */
export function DayOffButton({
  date,
  isDayOff,
  pendingCount,
  onMark,
  onUnmark,
  open,
  onOpenChange,
}: Props) {
  const [ownOpen, setOwnOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : ownOpen;
  const setIsOpen = (next: boolean) =>
    isControlled ? onOpenChange?.(next) : setOwnOpen(next);
  const { title, description, confirmLabel } = buildDayOffConfirmation(
    isDayOff,
    pendingCount
  );

  return (
    <>
      {!isControlled && (
        <Button.Root
          appearance="tinted"
          color="neutral"
          size="sm"
          onClick={() => setIsOpen(true)}
        >
          <Button.Icon icon={isDayOff ? CalendarPlus : CalendarOff} />
          <Button.Title>
            {isDayOff ? "Voltar a trabalhar" : "Não vou trabalhar"}
          </Button.Title>
        </Button.Root>
      )}

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
