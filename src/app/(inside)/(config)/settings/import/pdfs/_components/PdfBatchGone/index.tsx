import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ArrowLeft, FileQuestion } from "lucide-react";

import { PDF_BATCHES_PATH } from "../../utils";

/**
 * O lote do link não existe mais (excluído, ou de outra empresa): tentar de
 * novo não adianta, então a saída é voltar à lista dos lotes.
 */
export function PdfBatchGone() {
  return (
    <EmptyState.Root flat>
      <EmptyState.Icon>
        <FileQuestion />
      </EmptyState.Icon>
      <EmptyState.Title>Este lote não existe mais</EmptyState.Title>
      <EmptyState.Description>
        Ele foi excluído, ou o link está incompleto. Os lotes abertos ficam na
        lista de pedidos em PDF.
      </EmptyState.Description>
      <EmptyState.Actions>
        <Button.Link
          href={PDF_BATCHES_PATH}
          appearance="outline"
          color="neutral"
          size="md"
        >
          <Button.Icon icon={ArrowLeft} />
          <Button.Title>Ver os lotes</Button.Title>
        </Button.Link>
      </EmptyState.Actions>
    </EmptyState.Root>
  );
}
