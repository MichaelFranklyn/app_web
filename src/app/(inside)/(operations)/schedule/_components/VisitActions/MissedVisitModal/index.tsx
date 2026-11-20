"use client";
import { OptionCard } from "@/components/OptionCard";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { contactNoun, VisitContactType } from "@/utils/visit";
import { CalendarClock, Clock, UserX } from "lucide-react";

/** Os motivos que fecham a visita sem ela ter acontecido. */
export type MissedReason = "CLIENT_ABSENT" | "NO_TIME";

interface Props {
  clientName: string;
  contactType: VisitContactType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Registra o motivo; o modal fecha sozinho na hora. */
  onReason: (reason: MissedReason) => void;
  /** Troca este modal pelo de remarcar (um no lugar do outro, nunca empilhado). */
  onReschedule: () => void;
}

/**
 * O "Não deu" do cartão e do aviso no celular: o motivo numa tela só, um toque
 * em cada opção. São os mesmos desfechos das visitas vencidas — "não estava"
 * conta como tentativa, e "não deu tempo" devolve o cliente para o motor
 * replanejar.
 */
export function MissedVisitModal({
  clientName,
  contactType,
  open,
  onOpenChange,
  onReason,
  onReschedule,
}: Props) {
  const isRemote = contactType === "REMOTE";
  const noun = contactNoun(contactType);

  const choose = (reason: MissedReason) => {
    onOpenChange(false);
    onReason(reason);
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header
          title="O que aconteceu?"
          description={`Conte por que a ${noun} com ${clientName} não aconteceu.`}
        />
        <Modal.Body>
          <div className="flex flex-col gap-8">
            <OptionCard
              icon={UserX}
              title={isRemote ? "Não atendeu" : "Não estava"}
              description={
                isRemote
                  ? "Liguei, mas o cliente não atendeu."
                  : "Fui até a loja, mas o responsável não estava."
              }
              onClick={() => choose("CLIENT_ABSENT")}
            />
            <OptionCard
              icon={Clock}
              title="Não deu tempo"
              description="O sistema volta a sugerir este cliente nos próximos dias."
              onClick={() => choose("NO_TIME")}
            />
            <OptionCard
              icon={CalendarClock}
              title="Remarcar"
              description="Escolher outro dia para esta parada."
              onClick={onReschedule}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
            >
              <Button.Title>Voltar</Button.Title>
            </Button.Root>
          </Modal.Close>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
