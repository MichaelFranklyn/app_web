"use client";

import { Button } from "@/components/Button";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";
import { FilePlus2 } from "lucide-react";

import { HistoryBatchesCard } from "../_components/HistoryBatchesCard";
import { PdfBatchesCard } from "./_components/PdfBatchesCard";
import { PdfBreadcrumb } from "./_components/PdfBreadcrumb";
import { NEW_PDF_BATCH_PATH } from "./utils";

/**
 * A lista dos lotes de PDFs. Abrir um lote (novo ou já começado) leva ao
 * assistente, em tela própria: lista e passo a passo juntos confundiam.
 */
export default function OrderPdfBatchesContent() {
  return (
    <PageContent>
      <div className="flex flex-col gap-8">
        <PdfBreadcrumb />
        <PanelHeader.Root>
          <PanelHeader.Top>
            <PanelHeader.Left>
              <PanelHeader.Heading {...PAGE_HEADING.import}>
                Pedidos em PDF
              </PanelHeader.Heading>
              <PanelHeader.Description>
                Envie os PDFs dos pedidos de uma fábrica: o sistema lê o
                cliente, a data e os itens de cada um e grava os pedidos como
                pedidos antigos, sem avisar ninguém, sem conferir valor mínimo e
                sem fechar visita. Cada lote fica guardado; dá para voltar e
                terminar depois.
              </PanelHeader.Description>
              <PanelHeader.Actions>
                <Button.Link
                  href={NEW_PDF_BATCH_PATH}
                  appearance="solid"
                  color="amber"
                  size="sm"
                >
                  <Button.Icon icon={FilePlus2} />
                  <Button.Title>Novo lote</Button.Title>
                </Button.Link>
              </PanelHeader.Actions>
            </PanelHeader.Left>
          </PanelHeader.Top>
        </PanelHeader.Root>
      </div>

      <PdfBatchesCard />
      <HistoryBatchesCard />
    </PageContent>
  );
}
