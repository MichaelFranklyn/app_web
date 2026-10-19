"use client";

import { Button } from "@/components/Button";
import { Calendar } from "@/components/Calendar";
import { Dropdown } from "@/components/Dropdown";
import { FollowUpModal } from "@/components/FollowUpModal";
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
   * `button`: o "+ Agendar" no pé do dia (semana e dia). `cell`: a célula
   * inteira do mês é o gatilho — clicar no vazio do dia, como no Google.
   */
  variant?: "button" | "cell";
  onChanged: () => void;
}

/**
 * Marcar algo num dia: um contato ou uma visita.
 *
 * O contato (ligação ou WhatsApp, com o motivo combinado) cabe em qualquer
 * agenda e em qualquer dia à frente — é o único caminho de marcar ligação
 * aqui, para "contato" e "ligar para o cliente" não parecerem coisas
 * diferentes; o modal de visita chega com o tipo já decidido.
 *
 * A visita é da rotina de quem vende, num dia que ele trabalha — a semana da
 * rotina nasce se ainda não existir. Com uma opção só, o gatilho abre direto.
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
        fullWidth
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
              Contato (ligação ou WhatsApp)
            </Dropdown.Item>
            <Dropdown.Item icon={Car} onSelect={() => setModal("visit")}>
              Visita
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown.Root>
      ) : (
        trigger
      )}

      <FollowUpModal
        open={modal === "contact"}
        onOpenChange={(open) => setModal(open ? "contact" : null)}
        defaultDueDate={date}
        defaultResponsible={person}
        onSaved={onChanged}
      />
      {canVisit && sellerId && (
        <ScheduleVisitModal
          open={modal === "visit"}
          onOpenChange={(open) => setModal(open ? "visit" : null)}
          sellerId={sellerId}
          defaultDate={date}
          contactType="IN_PERSON"
          onScheduled={onChanged}
        />
      )}
    </>
  );
}
