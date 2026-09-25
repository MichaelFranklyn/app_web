"use client";

import { ConfirmModal } from "@/components/ConfirmModal";

interface Props {
  open: boolean;
  itemCount: number;
  onLeave: () => void;
  onStay: () => void;
}

/**
 * "Sair sem criar o pedido?" — aparece quando o vendedor tenta sair da página
 * (link, Voltar, Cancelar) com algo feito e não gravado: itens, um item
 * começado ou os dados do pedido. Nada disso existe antes de "Criar pedido".
 */
/** O que se perde, dito em termos do que o vendedor fez. */
const lossOf = (itemCount: number) => {
  if (itemCount === 1) return "o item adicionado será perdido";
  if (itemCount > 1) return `os ${itemCount} itens adicionados serão perdidos`;
  return "o que você já preencheu será perdido";
};

export function LeaveOrderModal({ open, itemCount, onLeave, onStay }: Props) {
  return (
    <ConfirmModal
      open={open}
      onOpenChange={(next) => !next && onStay()}
      title="Sair sem criar o pedido?"
      description={`O pedido ainda não foi criado. Se sair agora, ${lossOf(
        itemCount
      )}. Para guardar, volte e clique em “Criar pedido”.`}
      cancelLabel="Continuar no pedido"
      confirmLabel="Sair e descartar"
      confirmColor="red"
      onConfirm={async () => onLeave()}
    />
  );
}
