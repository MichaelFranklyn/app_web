"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { FileCode2 } from "lucide-react";
import { useState } from "react";

import { NfePreviewList } from "./NfePreviewList";
import { useImportNfe } from "./useImportNfe";
import { MAX_NFE_FILES, isInvoiceable } from "./utils";

interface Props {
  onInvoiced: () => void;
}

/**
 * Faturar pedidos pelo XML da nota que a fábrica mandou. Dois passos no mesmo
 * modal: escolher os arquivos e conferir a prévia. Só a nota que conta a mesma
 * história do pedido fatura daqui — o resto aponta para onde se resolve.
 */
export function ImportNfeModal({ onInvoiced }: Props) {
  const [open, setOpen] = useState(false);
  const flow = useImportNfe({
    onInvoiced: () => {
      setOpen(false);
      onInvoiced();
    },
  });
  const readyCount = (flow.previews ?? []).filter(
    (row) => isInvoiceable(row.status) && flow.selected.has(row.fileName)
  ).length;

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) flow.reset();
  };

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="sm">
          <Button.Icon icon={FileCode2} />
          <Button.Title>Faturar pelo XML da nota</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size={flow.previews ? "5xl" : "md"}>
        <Modal.Header
          title="Faturar pelo XML da nota"
          description="Envie os arquivos XML das notas que a fábrica mandou. O sistema acha o pedido de cada nota e fatura com a data e o número dela."
        />
        <Modal.Body>
          {flow.previews ? (
            <NfePreviewList
              rows={flow.previews}
              selected={flow.selected}
              onToggle={flow.toggle}
            />
          ) : (
            <div className="flex flex-col gap-12">
              <Input.Archive
                label="Arquivos XML das notas"
                hint={`Até ${MAX_NFE_FILES} arquivos de uma vez. O XML costuma vir no e-mail da fábrica, junto do PDF da nota.`}
                variant="multi"
                accept=".xml,text/xml,application/xml"
                maxFiles={MAX_NFE_FILES}
                maxSizeMb={5}
                value={flow.files}
                onChange={flow.setFiles}
              />
              <Title variant="body-sm" color="muted">
                Nada é gravado antes de você conferir a lista na próxima etapa.
              </Title>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {flow.previews ? (
            <>
              <Button.Root
                type="button"
                appearance="ghost"
                color="neutral"
                size="md"
                noUppercase
                disabled={flow.isInvoicing}
                onClick={flow.reset}
              >
                <Button.Title>Escolher outros arquivos</Button.Title>
              </Button.Root>
              <Button.Root
                type="button"
                appearance="solid"
                color="amber"
                size="md"
                noUppercase
                loading={flow.isInvoicing}
                disabled={readyCount === 0}
                onClick={flow.runInvoice}
              >
                <Button.Title>
                  {readyCount > 0
                    ? `Faturar ${readyCount} pedido(s)`
                    : "Nenhuma nota pronta"}
                </Button.Title>
              </Button.Root>
            </>
          ) : (
            <>
              <Modal.Close asChild>
                <Button.Root
                  type="button"
                  appearance="ghost"
                  color="neutral"
                  size="md"
                  noUppercase
                >
                  <Button.Title>Cancelar</Button.Title>
                </Button.Root>
              </Modal.Close>
              <Button.Root
                type="button"
                appearance="solid"
                color="amber"
                size="md"
                noUppercase
                loading={flow.isPreviewing}
                disabled={flow.files.length === 0}
                onClick={flow.runPreview}
              >
                <Button.Title>Conferir as notas</Button.Title>
              </Button.Root>
            </>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
