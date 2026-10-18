"use client";

import { Button } from "@/components/Button";
import { ScheduleVisitModal } from "@/components/ScheduleVisitModal";
import { CalendarPlus } from "lucide-react";
import { useState } from "react";

interface Props {
  /** Vendedor da agenda em tela — a carteira de onde saem os clientes. */
  sellerId: string | null;
  /** Chamado depois de marcar, para a lista de visitas marcadas recarregar. */
  onScheduled: () => void;
}

/**
 * "Marcar visita" na seção de visitas marcadas de Montar semana: cliente e
 * dia escolhidos na hora (morava no cabeçalho da Agenda até 18/10/2026).
 *
 * A data é livre — é o caso do cliente que liga pedindo "passa aqui dia 12"
 * quando aquela semana ainda não tem nada marcado.
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
