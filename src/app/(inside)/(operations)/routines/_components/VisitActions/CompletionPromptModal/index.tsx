"use client";
import { OptionCard } from "@/components/OptionCard";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { PackageSearch, ReceiptText } from "lucide-react";
import {
  contactLabel,
  contactArticle,
  contactNoun,
  VisitContactType,
} from "@/utils/visit";

interface Props {
  clientName: string;
  contactType: VisitContactType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Abre o registro de estoque do cliente. */
  onStock: () => void;
  /** Abre a página de novo pedido desta visita (ausente quando não há cliente). */
  onOrder?: () => void;
}

// Aparece logo após o vendedor concluir a parada, oferecendo os dois
// desdobramentos naturais: lançar o pedido ou registrar o estoque. Vale para
// contato remoto tanto quanto para visita — perguntar o estoque por telefone é
// justamente o motivo de a ligação existir na rotina.
export function CompletionPromptModal({
  clientName,
  contactType,
  open,
  onOpenChange,
  onStock,
  onOrder,
}: Props) {
  const isRemote = contactType === "REMOTE";
  const noun = contactNoun(contactType);
  const article = contactArticle(contactType);

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header
          title={`${contactLabel(contactType)} concluíd${isRemote ? "o" : "a"}`}
          description={`O que deseja registrar d${article} ${noun} com ${clientName}?`}
        />
        <Modal.Body>
          <div className="flex flex-col gap-8">
            {onOrder && (
              <OptionCard
                icon={ReceiptText}
                title="Novo pedido"
                description={`Registrar um pedido feito ${isRemote ? "neste contato" : "nesta visita"}.`}
                onClick={() => {
                  onOpenChange(false);
                  onOrder();
                }}
              />
            )}
            <OptionCard
              icon={PackageSearch}
              title="Atualizar estoque do cliente"
              description="Anotar como está o estoque dos produtos."
              onClick={onStock}
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
              noUppercase
            >
              <Button.Title>Agora não</Button.Title>
            </Button.Root>
          </Modal.Close>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
