"use client";

import { Button } from "@/components/Button";
import { FollowUpModal } from "@/components/FollowUpModal";
import { FollowUpDetail } from "@/utils/followUp";
import { CalendarClock, Check, Pencil, X } from "lucide-react";
import { useState } from "react";

import { CancelFollowUpModal } from "../CancelFollowUpModal";
import { CompleteFollowUpModal } from "../CompleteFollowUpModal";
import { RescheduleFollowUpModal } from "../RescheduleFollowUpModal";

type Action = "complete" | "reschedule" | "edit" | "cancel" | null;

interface Props {
  followUp: FollowUpDetail;
  onChanged: () => void;
}

/**
 * As quatro saídas de um contato em aberto. Um modal por vez (`action`): nunca
 * modal sobre modal.
 *
 * Concluir é o botão principal (âmbar): é o que se veio fazer aqui na maioria
 * das vezes. Cancelar fica em vermelho — encerra o compromisso.
 */
export function FollowUpActions({ followUp, onChanged }: Props) {
  const [action, setAction] = useState<Action>(null);
  const close = (open: boolean) => !open && setAction(null);

  return (
    <>
      <Button.Root
        type="button"
        appearance="solid"
        color="amber"
        size="sm"
        noUppercase
        onClick={() => setAction("complete")}
      >
        <Button.Icon icon={Check} />
        <Button.Title>Concluir</Button.Title>
      </Button.Root>
      <Button.Root
        type="button"
        appearance="outline"
        color="neutral"
        size="sm"
        noUppercase
        onClick={() => setAction("reschedule")}
      >
        <Button.Icon icon={CalendarClock} />
        <Button.Title>Reagendar</Button.Title>
      </Button.Root>
      <Button.Root
        type="button"
        appearance="outline"
        color="neutral"
        size="sm"
        noUppercase
        onClick={() => setAction("edit")}
      >
        <Button.Icon icon={Pencil} />
        <Button.Title>Corrigir</Button.Title>
      </Button.Root>
      <Button.Root
        type="button"
        appearance="outline"
        color="red"
        size="sm"
        noUppercase
        onClick={() => setAction("cancel")}
      >
        <Button.Icon icon={X} />
        <Button.Title>Cancelar contato</Button.Title>
      </Button.Root>

      {/* Montado só quando aberto: as respostas nascem do padrão ATUAL do
          contato (o responsável pode ter mudado desde a última abertura). */}
      {action === "complete" && (
        <CompleteFollowUpModal
          open
          onOpenChange={close}
          followUp={followUp}
          onDone={onChanged}
        />
      )}
      <RescheduleFollowUpModal
        open={action === "reschedule"}
        onOpenChange={close}
        followUp={followUp}
        onDone={onChanged}
      />
      <CancelFollowUpModal
        open={action === "cancel"}
        onOpenChange={close}
        followUp={followUp}
        onDone={onChanged}
      />
      <FollowUpModal
        open={action === "edit"}
        onOpenChange={close}
        followUp={followUp}
        onSaved={onChanged}
      />
    </>
  );
}
