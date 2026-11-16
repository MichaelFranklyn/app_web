"use client";

import { Upload } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Button } from "@/components/Button";
import { Loading } from "@/components/Loading";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";

import type { OrderDraftItems } from "../../../../../_shared/orderDraftItems";
import { describeDraftImport } from "./utils";

// Sob demanda, como no detalhe do pedido: o wizard (parsers de PDF/Excel e o
// casamento de produtos) só serve depois do clique, e estático ele pesaria no
// primeiro desenho de "Novo pedido".
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
  draft: OrderDraftItems;
  factoryId: string;
  /** Com cliente, a pré-visualização usa o nível de preço do vínculo. */
  clientId?: string | null;
  /** Sem rede: a leitura e o casamento dependem do servidor. */
  disabled?: boolean;
}

/**
 * Importa itens de uma planilha (ou PDF) para o RASCUNHO de `/orders/new`.
 *
 * Diferente do detalhe do pedido, nada é gravado: os itens conferidos entram
 * na lista do card e seguem o caminho de qualquer item digitado até o
 * "Criar pedido".
 */
export function ImportItemsModal({
  draft,
  factoryId,
  clientId,
  disabled,
}: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const handleOpenChange = (value: boolean) => {
    if (!value && isBusy) return; // Não fecha durante upload/pré-visualização.
    setOpen(value);
  };

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Trigger asChild>
        <Button.Root
          type="button"
          appearance="outline"
          color="neutral"
          size="sm"
          disabled={disabled}
        >
          <Button.Icon icon={Upload} />
          <Button.Title>Importar de planilha</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="5xl">
        <Modal.Header
          title="Importar itens de planilha"
          description="Suba a planilha ou o PDF com os produtos: lemos as linhas, casamos com o catálogo da fábrica e você confere antes de levar para a lista."
        />
        <OrderImportWizard
          draft={{
            factoryId,
            clientId,
            onItems: (items) => {
              const result = draft.appendItems(items);
              toast({
                variant: "success",
                title: "Itens levados para a lista",
                description: describeDraftImport(result),
              });
            },
          }}
          ipiInOrder={draft.ipiInOrder}
          onImported={() => setOpen(false)}
          onBusyChange={setIsBusy}
          onClose={() => setOpen(false)}
        />
      </Modal.Content>
    </Modal.Root>
  );
}
