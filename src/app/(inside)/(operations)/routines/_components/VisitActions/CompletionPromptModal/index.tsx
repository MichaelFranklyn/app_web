"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { ChevronRight, PackageSearch, ReceiptText } from "lucide-react";

interface Props {
  clientName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Abre o registro de estoque do cliente. */
  onStock: () => void;
  /** Leva à tela de pedidos do cliente (ausente quando não há cliente). */
  onOrder?: () => void;
}

interface OptionProps {
  icon: typeof PackageSearch;
  title: string;
  description: string;
  onClick: () => void;
}

// Opção grande e clicável (alvo generoso, uma ação por linha) para o público
// da rota, que decide na hora o próximo passo após concluir a visita.
function Option({ icon: Icon, title, description, onClick }: OptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-12 rounded-(--r-md) border border-(--border) bg-(--bg3) px-16 py-12 text-left transition-colors hover:border-(--amber) focus:outline-none focus-visible:ring-1 focus-visible:ring-(--amber)"
    >
      <span className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-(--amber-bg) text-(--amber)">
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <Title variant="body-sm" className="font-medium">
          {title}
        </Title>
        <Title variant="body-xs" color="muted">
          {description}
        </Title>
      </span>
      <ChevronRight size={16} className="shrink-0 text-(--muted)" />
    </button>
  );
}

// Aparece logo após o vendedor marcar a visita como concluída, oferecendo os
// dois desdobramentos naturais: lançar o pedido ou registrar o estoque.
export function CompletionPromptModal({
  clientName,
  open,
  onOpenChange,
  onStock,
  onOrder,
}: Props) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header
          title="Visita concluída"
          description={`O que deseja registrar da visita a ${clientName}?`}
        />
        <Modal.Body>
          <div className="flex flex-col gap-8">
            {onOrder && (
              <Option
                icon={ReceiptText}
                title="Lançar novo pedido"
                description="Registrar um pedido feito nesta visita."
                onClick={() => {
                  onOpenChange(false);
                  onOrder();
                }}
              />
            )}
            <Option
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
