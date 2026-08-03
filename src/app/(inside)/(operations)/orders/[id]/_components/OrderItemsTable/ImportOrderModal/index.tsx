"use client";

import { Upload } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Button } from "@/components/Button";
import { Loading } from "@/components/Loading";
import { Modal } from "@/components/Modal";

// Carregado sob demanda: o wizard é o maior bloco de JS da tela (os três passos,
// os parsers de PDF/Excel e o casamento de produtos) e só serve depois do clique
// em "Importar pedido". Estático, ele entrava no bundle da rota e era baixado e
// interpretado antes do primeiro desenho do DETALHE do pedido — que é o que
// praticamente todo mundo que abre esta página veio ver.
const OrderImportWizard = dynamic(
  () =>
    import("../../../../../_components/OrderImportWizard").then(
      (m) => m.OrderImportWizard
    ),
  {
    loading: () => (
      <div className="flex items-center justify-center py-64">
        <Loading.Spinner size="lg" />
      </div>
    ),
  }
);

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
