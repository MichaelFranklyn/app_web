"use client";

import { Button } from "@/components/Button";
import { ScheduleVisitModal } from "@/components/ScheduleVisitModal";
import { CalendarPlus } from "lucide-react";
import { useState } from "react";

interface Props {
  /** Vendedor da rotina em tela — a carteira de onde saem os clientes. */
  sellerId: string | null;
  /** Chamado depois de marcar, para a semana em tela recarregar. */
  onScheduled: () => void;
}

/**
 * "Marcar visita" no cabeçalho da rotina: cliente e dia escolhidos na hora.
 *
 * Diferente do "+" de cada card, que só alcança um dia que já está na tela —
 * aqui a data é livre, e é o caso do cliente que liga pedindo "passa aqui dia
 * 12" quando aquela semana ainda não tem rotina nenhuma.
 */
export function ScheduleVisitButton({ sellerId, onScheduled }: Props) {
  const [open, setOpen] = useState(false);

  // Sem vendedor resolvido não há carteira de onde escolher o cliente.
  if (!sellerId) return null;

  return (
    <>
      <Button.Root
        type="button"
        appearance="solid"
        color="amber"
        size="sm"
        noUppercase
        onClick={() => setOpen(true)}
      >
        <Button.Icon icon={CalendarPlus} />
        <Button.Title>Marcar visita</Button.Title>
      </Button.Root>

      <ScheduleVisitModal
        open={open}
        onOpenChange={setOpen}
        sellerId={sellerId}
        onScheduled={onScheduled}
      />
    </>
  );
}
