"use client";

import { Upload } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";

import { OrderImportWizard } from "../../../../../_components/OrderImportWizard";

interface Props {
  orderId: string;
  /** Fábrica cobra IPI no pedido: habilita mapear/editar a alíquota por item. */
  ipiInOrder?: boolean;
  /** Disparado após gravar itens — recarrega a tabela e os totais do pedido. */
  onImported: () => void;
}

/** Importa itens para um pedido EXISTENTE (detalhe do pedido). */
export function ImportOrderModal({ orderId, ipiInOrder, onImported }: Props) {
  const [open, setOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const handleOpenChange = (value: boolean) => {
    if (!value && isBusy) return; // Não fecha durante upload/preview/gravação.
    setOpen(value);
  };

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Trigger asChild>
        <Button.Root appearance="outline" color="neutral" size="sm">
          <Button.Icon icon={Upload} />
          <Button.Title>Importar pedido</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="5xl">
        <Modal.Header
          title="Importar itens do pedido"
          description="Suba o pedido da fábrica em PDF ou Excel: lemos as linhas, casamos os produtos e você confere antes de gravar."
        />
        <OrderImportWizard
          orderId={orderId}
          ipiInOrder={ipiInOrder}
          onImported={onImported}
          onBusyChange={setIsBusy}
          onClose={() => setOpen(false)}
        />
      </Modal.Content>
    </Modal.Root>
  );
}
