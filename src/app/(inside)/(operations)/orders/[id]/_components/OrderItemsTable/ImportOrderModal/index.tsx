"use client";

import { Upload } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";

import { OrderImportWizard } from "./OrderImportWizard";

interface Props {
  orderId: string;
  /** Disparado após gravar itens — recarrega a tabela e os totais do pedido. */
  onImported: () => void;
}

/** Importa itens para um pedido EXISTENTE (detalhe do pedido). */
export function ImportOrderModal({ orderId, onImported }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleOpenChange = (value: boolean) => {
    if (!value && busy) return; // Não fecha durante upload/preview/gravação.
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
          onImported={onImported}
          onBusyChange={setBusy}
          onClose={() => setOpen(false)}
        />
      </Modal.Content>
    </Modal.Root>
  );
}
