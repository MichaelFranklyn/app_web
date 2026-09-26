"use client";

import { Modal } from "@/components/Modal";
import { useRedirectTransition } from "@/hooks/useRedirectTransition";
import { newOrderUrl } from "@/utils/newOrderUrl";
import { usePathname } from "next/navigation";

import { StockObservationList } from "./StockObservationList";
import { StockCandidateGroup } from "./useStockObservation";

interface Props {
  /** Id da visita (visit_schedule_item). */
  itemId: string;
  clientName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

/**
 * Registro do estoque do cliente durante a visita, fábrica por fábrica.
 *
 * Compartilhado entre a rotina do vendedor (`/routines`) e o histórico de visitas
 * do cliente (`/clients/[id]/visits`) — de onde o vendedor também pode registrar
 * o que viu, depois da visita.
 *
 * "Novo pedido" leva à página de novo pedido (`/orders/new`) com vendedor,
 * cliente e fábrica decididos e o pedido amarrado a esta visita. Antes de sair,
 * o que foi respondido do estoque é gravado — a página não tem como devolver o
 * formulário. "Cancelar" lá volta para a tela de onde a visita foi aberta.
 */
export function VisitStockModal({
  itemId,
  clientName,
  open,
  onOpenChange,
  onSaved,
}: Props) {
  const pathname = usePathname();
  // O loading do botão segue até a página do pedido abrir; quem desmonta este
  // modal é a navegação.
  const { redirect, isRedirecting } = useRedirectTransition();

  const openOrder = (group: StockCandidateGroup) => {
    // Sem fábrica não há pedido; o botão já fica desabilitado.
    if (!group.factory) return;
    redirect(
      newOrderUrl(
        {
          visitItemId: itemId,
          sellerId: group.sellerId,
          clientId: group.clientId,
          factoryId: group.factory.id,
        },
        pathname
      )
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="5xl">
        <Modal.Header
          title={`Estoque · ${clientName}`}
          description="Toque numa fábrica para abrir os produtos dela. Em cada uma, o sistema destaca os poucos que realmente decidem se este cliente precisa de visita — pergunte por esses. O resto ele estima sozinho."
        />
        <Modal.Body>
          <StockObservationList
            itemId={itemId}
            // Salvou: o trabalho acabou. Deixar o modal aberto obriga o vendedor
            // a fechá-lo à mão para ver o efeito nas abas de estoque e score.
            onSaved={() => {
              onSaved?.();
              onOpenChange(false);
            }}
            onOrder={openOrder}
            isLeaving={isRedirecting}
          />
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
