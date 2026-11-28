"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Sparkles, Undo2 } from "lucide-react";

import { PdfFileOverride, PdfImportFile } from "../../interface";
import {
  isSuggestedClient,
  isSuggestedTerms,
  undoClientSuggestion,
  undoTermsSuggestion,
} from "../../utils";

interface Props {
  file: PdfImportFile;
  override?: PdfFileOverride;
  onOverride: (change: PdfFileOverride) => void;
  disabled: boolean;
}

/**
 * O que a leitura aprendeu desta fábrica e já pôs no PDF: a condição e o
 * cliente que a pessoa costuma acertar. Desfazer volta ao que o PDF trouxe —
 * e, importado assim, a leitura esquece o aprendido.
 */
export function PdfLearnedNotice({
  file,
  override,
  onOverride,
  disabled,
}: Props) {
  const terms = isSuggestedTerms(file, override);
  const client = isSuggestedClient(file, override);
  if (!terms && !client) return null;

  const what =
    terms && client
      ? "A condição de pagamento e o cliente"
      : terms
        ? "A condição de pagamento"
        : "O cliente";
  const read = file.header?.paymentTerms;

  return (
    <Alert.Root variant="info" role="note">
      <Alert.Icon icon={Sparkles} />
      <Alert.Content>
        <Alert.Title>Ajustado como nas suas últimas importações</Alert.Title>
        <Alert.Description>
          {what} {terms && client ? "vieram" : "veio"} como você costuma
          corrigir nos PDFs desta fábrica
          {terms ? ` (o PDF trouxe “${read || "sem condição"}”)` : ""}. Confira
          antes de importar.
        </Alert.Description>
      </Alert.Content>
      <Alert.Actions>
        {terms && (
          <Button.Root
            appearance="outline"
            color="neutral"
            size="sm"
            disabled={disabled}
            onClick={() => onOverride(undoTermsSuggestion(file))}
          >
            <Button.Icon icon={Undo2} />
            <Button.Title>Usar a condição do PDF</Button.Title>
          </Button.Root>
        )}
        {client && (
          <Button.Root
            appearance="outline"
            color="neutral"
            size="sm"
            disabled={disabled}
            onClick={() => onOverride(undoClientSuggestion())}
          >
            <Button.Icon icon={Undo2} />
            <Button.Title>Escolher outro cliente</Button.Title>
          </Button.Root>
        )}
      </Alert.Actions>
    </Alert.Root>
  );
}
