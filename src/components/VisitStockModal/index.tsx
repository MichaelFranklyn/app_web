"use client";

import { Modal } from "@/components/Modal";
import { useState } from "react";

import { StockObservationList } from "./StockObservationList";
import { StockCandidateGroup } from "./useStockObservation";
import { VisitOrderModal } from "./VisitOrderModal";

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
 * Estoque e pedido são DUAS telas, nunca uma sobre a outra: ao lançar o pedido, o
 * modal de estoque some e o de pedido aparece; cancelar devolve o vendedor ao
 * estoque, com o que ele já havia respondido intacto no formulário.
 */
export function VisitStockModal({
  itemId,
  clientName,
  open,
  onOpenChange,
  onSaved,
}: Props) {
  const [orderingGroup, setOrderingGroup] =
    useState<StockCandidateGroup | null>(null);
  const isOrdering = orderingGroup !== null;

  const closeAll = (next: boolean) => {
    if (!next) setOrderingGroup(null);
    onOpenChange(next);
  };

  return (
    <>
      <Modal.Root open={open && !isOrdering} onOpenChange={closeAll}>
        <Modal.Content size="5xl">
          <Modal.Header
            title={`Estoque · ${clientName}`}
            description="Toque numa fábrica para abrir os produtos dela e pergunte ao cliente quantos dias cada um ainda dura. As que motivaram a visita já vêm abertas."
          />
          <Modal.Body>
            <StockObservationList
              itemId={itemId}
              // Salvou: o trabalho acabou. Deixar o modal aberto obriga o vendedor
              // a fechá-lo à mão para ver o efeito nas abas de estoque e score.
              onSaved={() => {
                onSaved?.();
                closeAll(false);
              }}
              onOrder={setOrderingGroup}
            />
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>

      <VisitOrderModal
        group={orderingGroup}
        itemId={itemId}
        open={open && isOrdering}
        onClose={() => setOrderingGroup(null)}
        onCreated={() => closeAll(false)}
      />
    </>
  );
}
