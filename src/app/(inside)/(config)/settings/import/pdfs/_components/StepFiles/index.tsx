"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { Progress } from "@/components/Progress";
import { QueryError } from "@/components/QueryError";
import { Stepper } from "@/components/Stepper";
import { Title } from "@/components/Title";
import { Info, X } from "lucide-react";

import { CreateMissingOptions } from "../../../_components/CreateMissingOptions";
import { MatchOption } from "../../../interface";
import {
  PdfFileOverride,
  PdfImportBatch,
  PdfImportFile,
  PdfUploadState,
} from "../../interface";
import { MAX_PDF_FILES, MAX_PDF_SIZE_MB } from "../../utils";
import { PdfFileRow } from "../PdfFileRow";

interface Props {
  batch: PdfImportBatch | null;
  files: PdfImportFile[];
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
  reading: boolean;
  onAdd: (files: File[]) => void;
  sending: boolean;
  progress: { done: number; total: number };
  failed: PdfUploadState[];
  onClearFailed: () => void;
  canResend: (fileName: string) => boolean;
  onResend: (fileName: string) => void;
  overrides: Record<string, PdfFileOverride>;
  onOverride: (fileId: string, change: PdfFileOverride) => void;
  sellerOptions: MatchOption[];
  rowsCount: number;
  createClients: boolean;
  onCreateClients: (value: boolean) => void;
  createProducts: boolean;
  onCreateProducts: (value: boolean) => void;
  disabled: boolean;
}

/** Passo 2: sobe os PDFs, mostra o que foi lido de cada um e o que falta acertar. */
export function StepFiles(props: Props) {
  if (props.loading) return <Loading.Skeleton className="h-[200px] w-full" />;
  if (props.error || !props.batch) {
    return <QueryError flat onRetry={props.onRetry} />;
  }

  const imported = props.files.filter((f) => f.status === "IMPORTED").length;
  const open = props.files.filter((f) => f.status !== "IMPORTED");
  const sendingNow = props.sending && props.progress.total > 0;

  return (
    <div className="flex flex-col gap-12">
      <Stepper.Intro step={2} total={3} title="Envie os PDFs">
        Escolha os PDFs dos pedidos de {props.batch.factoryName}, quantos
        quiser. Cada um é lido na hora; o mesmo PDF enviado duas vezes entra uma
        vez só.
      </Stepper.Intro>

      <Input.Archive
        variant="multi"
        label="PDFs dos pedidos"
        hint={`Até ${MAX_PDF_FILES} arquivos de até ${MAX_PDF_SIZE_MB} MB cada.`}
        accept=".pdf,application/pdf"
        value={[]}
        maxFiles={MAX_PDF_FILES}
        maxSizeMb={MAX_PDF_SIZE_MB}
        disabled={props.disabled}
        onChange={props.onAdd}
      />

      {sendingNow && (
        <div className="flex flex-col gap-4">
          <Title variant="body-xs" color="muted">
            Enviando {props.progress.done} de {props.progress.total} PDF(s)…
          </Title>
          <Progress
            value={(props.progress.done / props.progress.total) * 100}
            label="Envio dos PDFs"
          />
        </div>
      )}

      {props.failed.length > 0 && (
        <Alert.Root variant="error">
          <Alert.Icon icon={Info} />
          <Alert.Content>
            <Alert.Description>
              {props.failed.length} PDF(s) não subiram:{" "}
              {props.failed
                .map((f) => `${f.fileName} (${f.error ?? "erro no envio"})`)
                .join("; ")}
              . Escolha-os de novo para tentar outra vez.
            </Alert.Description>
          </Alert.Content>
          <Button.Root
            appearance="ghost"
            color="neutral"
            size="sm"
            aria-label="Dispensar aviso"
            onClick={props.onClearFailed}
          >
            <Button.Icon icon={X} />
          </Button.Root>
        </Alert.Root>
      )}

      {props.reading && (
        <Title variant="body-xs" color="muted">
          Lendo os PDFs; a lista se atualiza sozinha.
        </Title>
      )}

      {imported > 0 && (
        <Title variant="body-xs" color="muted">
          {imported} PDF(s) deste lote já foram importados.
        </Title>
      )}

      {open.length > 0 && (
        <div className="flex flex-col gap-8">
          {open.map((file) => (
            <PdfFileRow
              key={file.id}
              batch={props.batch!}
              file={file}
              override={props.overrides[file.id]}
              onOverride={(change) => props.onOverride(file.id, change)}
              sellerOptions={props.sellerOptions}
              canResend={props.canResend(file.fileName)}
              onResend={() => props.onResend(file.fileName)}
              disabled={props.disabled}
            />
          ))}
        </div>
      )}

      {open.length > 0 && (
        <CreateMissingOptions
          createClients={props.createClients}
          onCreateClients={props.onCreateClients}
          createProducts={props.createProducts}
          onCreateProducts={props.onCreateProducts}
        />
      )}

      {!props.sending &&
        !props.reading &&
        open.length > 0 &&
        props.rowsCount === 0 && (
          <Alert.Root variant="warning">
            <Alert.Icon icon={Info} />
            <Alert.Content>
              <Alert.Description>
                Nenhum PDF pronto para importar. Acerte os avisos acima ou envie
                outros PDFs.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}
    </div>
  );
}
