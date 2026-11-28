"use client";

import { ConfirmModal } from "@/components/ConfirmModal";
import { Input, RequiredMark } from "@/components/Input";
import { Title } from "@/components/Title";
import { useMutation } from "@apollo/client/react";
import { useState } from "react";

import {
  DELETE_ORDER_PDF_IMPORT_FILE_MUTATION,
  ORDER_PDF_IMPORT_BATCH_QUERY,
  ORDER_PDF_IMPORT_BATCHES_QUERY,
} from "../../gql";
import { DeletePdfImportFileResponse, PdfImportFile } from "../../interface";
import { PdfWrongFieldCheck } from "../PdfWrongFieldCheck";
import {
  discardNote,
  PDF_OTHER_REASONS,
  PDF_WRONG_FIELDS,
  PdfDiscardReason,
  PdfField,
  readFieldValue,
  WrongFieldsDraft,
  wrongFieldsInput,
} from "./reasons";

interface Props {
  batchId: string;
  file: PdfImportFile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Confirma a saída de um PDF do lote e pergunta o motivo: os campos que a
 * leitura errou (com o valor certo, se a pessoa quiser ensinar) OU um motivo
 * que é do arquivo. Campo marcado vai ao diagnóstico com o PDF; com o valor
 * certo, o back aprende onde ele fica nos próximos PDFs da fábrica. O texto
 * livre só é guardado se fizer sentido. Enviar o arquivo de novo o traz de volta.
 */
export function DeletePdfFileModal({
  batchId,
  file,
  open,
  onOpenChange,
}: Props) {
  const [fields, setFields] = useState<WrongFieldsDraft>({});
  const [reason, setReason] = useState<PdfDiscardReason | null>(null);
  const [note, setNote] = useState("");
  const hasFields = Object.keys(fields).length > 0;

  // Campo errado e motivo do arquivo se excluem: escolher um limpa o outro.
  const toggleField = (field: PdfField, checked: boolean) => {
    setReason(null);
    setFields((current) => {
      const next = { ...current };
      if (checked) next[field] = "";
      else delete next[field];
      return next;
    });
  };
  const chooseReason = (value: PdfDiscardReason) => {
    setFields({});
    setReason(value);
  };
  const [deleteFile] = useMutation<DeletePdfImportFileResponse>(
    DELETE_ORDER_PDF_IMPORT_FILE_MUTATION,
    {
      refetchQueries: [
        ORDER_PDF_IMPORT_BATCH_QUERY,
        ORDER_PDF_IMPORT_BATCHES_QUERY,
      ],
      awaitRefetchQueries: true,
    }
  );

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setFields({});
      setReason(null);
      setNote("");
    }
    onOpenChange(value);
  };

  return (
    <ConfirmModal
      open={open}
      onOpenChange={handleOpenChange}
      title="Excluir PDF do lote"
      description={`${file.fileName} sai do lote e não vira pedido. Para trazê-lo de volta, envie o arquivo de novo.`}
      confirmLabel="Excluir"
      confirmDisabled={!reason && !hasFields}
      successMessage="PDF excluído do lote"
      onConfirm={async () => {
        const res = await deleteFile({
          variables: {
            batchId,
            fileId: file.id,
            reason,
            note: discardNote(note),
            wrongFields: hasFields ? wrongFieldsInput(fields) : null,
          },
        });
        if (!res.data?.deleteOrderPdfImportFile?.status) {
          throw new Error(
            res.data?.deleteOrderPdfImportFile?.message ??
              "Não foi possível excluir o PDF."
          );
        }
        // Conta o que a leitura aprendeu ("Aprendemos onde fica o valor total...").
        return res.data.deleteOrderPdfImportFile.message ?? undefined;
      }}
    >
      <div className="flex flex-col gap-12">
        <fieldset className="flex flex-col gap-12">
          <legend className="mb-8">
            <Title variant="caption" color="muted">
              O que saiu errado?
              <RequiredMark />
            </Title>
          </legend>
          {PDF_WRONG_FIELDS.map((option) => (
            <PdfWrongFieldCheck
              key={option.value}
              id={`pdf-wrong-${option.value}`}
              label={option.label}
              readValue={readFieldValue(option.value, file)}
              checked={option.value in fields}
              onCheckedChange={(checked) => toggleField(option.value, checked)}
              placeholder={option.placeholder}
              value={fields[option.value] ?? ""}
              onValueChange={(value) =>
                setFields((current) => ({ ...current, [option.value]: value }))
              }
            />
          ))}
        </fieldset>
        <fieldset className="flex flex-col gap-8">
          <legend className="mb-8">
            <Title variant="caption" color="muted">
              Ou o problema é o arquivo?
            </Title>
          </legend>
          {PDF_OTHER_REASONS.map((option) => (
            <Input.Radio
              key={option.value}
              name="pdfDiscardReason"
              value={option.value}
              checked={reason === option.value}
              onChange={() => chooseReason(option.value)}
              label={option.label}
            />
          ))}
        </fieldset>
        <Input.Textarea
          id="pdf-discard-note"
          label="Conte mais"
          placeholder="Ex: o preço veio sem o IPI"
          hint="Ajuda a gente a ler melhor os próximos PDFs desta fábrica."
          maxLength={500}
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>
    </ConfirmModal>
  );
}
