"use client";

import { Button } from "@/components/Button";
import { Calendar } from "@/components/Calendar";
import { Dropdown } from "@/components/Dropdown";
import { ScheduleVisitModal } from "@/components/ScheduleVisitModal";
import { Car, Phone, Plus } from "lucide-react";
import { useState } from "react";

import { AgendaPerson } from "../../interface";

interface Props {
  date: string;
  /** A pessoa cuja agenda está aberta — vira o responsável sugerido. */
  person: AgendaPerson | null;
  /** Vendedor da agenda: só a rotina de quem vende recebe visita. */
  sellerId: string | null;
  isDayOff: boolean;
  /**
   * `button`: o "+ Agendar" no pé do dia da semana, na largura da coluna.
   * `header`: no cabeçalho do dia, na largura do texto. `cell`: a célula
   * inteira do mês é o gatilho — clicar no vazio do dia, como no Google.
   */
  variant?: "button" | "header" | "cell";
  onChanged: () => void;
}

/**
 * Marcar algo num dia: uma ligação ou uma visita — a mesma parada da agenda,
 * com tipos diferentes, pelo mesmo modal (chega com o tipo já decidido).
 *
 * A ligação cabe em qualquer agenda (inclusive a de quem não vende) e em
 * qualquer dia à frente. A visita é da rotina de quem vende, num dia que ele
 * trabalha — a semana nasce se ainda não existir. Com uma opção só, o gatilho
 * abre direto.
 */
export function AgendaAddMenu({
  date,
  person,
  sellerId,
  isDayOff,
  variant = "button",
  onChanged,
}: Props) {
  const [modal, setModal] = useState<"contact" | "visit" | null>(null);
  const canVisit = Boolean(sellerId && !isDayOff);
  const openDirect = canVisit ? undefined : () => setModal("contact");

  const trigger =
    variant === "cell" ? (
      <Calendar.CellHitArea label="Agendar neste dia" onClick={openDirect} />
    ) : (
      <Button.Root
        type="button"
        appearance="ghost"
        color="neutral"
        size="sm"
        noUppercase
        fullWidth={variant === "button"}
        dashed
        label="Agendar neste dia"
        onClick={openDirect}
      >
        <Button.Icon icon={Plus} />
        <Button.Title>Agendar</Button.Title>
      </Button.Root>
    );

  return (
    <>
      {canVisit ? (
        <Dropdown.Root>
          <Dropdown.Trigger asChild>{trigger}</Dropdown.Trigger>
          <Dropdown.Content align="start">
            <Dropdown.Item icon={Phone} onSelect={() => setModal("contact")}>
              Ligação
            </Dropdown.Item>
            <Dropdown.Item icon={Car} onSelect={() => setModal("visit")}>
              Visita
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown.Root>
      ) : (
        trigger
      )}

      <ScheduleVisitModal
        open={modal !== null}
        onOpenChange={(open) => !open && setModal(null)}
        owner={person}
        sellerId={sellerId}
        defaultDate={date}
        contactType={modal === "visit" ? "IN_PERSON" : "REMOTE"}
        onScheduled={onChanged}
      />
    </>
  );
}
