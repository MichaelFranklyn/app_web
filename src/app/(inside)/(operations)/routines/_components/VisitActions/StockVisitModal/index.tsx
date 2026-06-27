"use client";

import { Modal } from "@/components/Modal";
import { StockObservationTab } from "../StockObservationTab";
import { StockVisitModalProps } from "./interface";

export function StockVisitModal({
  item,
  open,
  onOpenChange,
}: StockVisitModalProps) {
  const client = item.clientFactoryLink?.client;
  const clientName = client?.nomeFantasia ?? client?.razaoSocial ?? "Cliente";

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title={`Estoque · ${clientName}`}
          description="Marque como está o estoque de cada produto do último pedido."
        />
        <Modal.Body>
          <StockObservationTab item={item} />
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
