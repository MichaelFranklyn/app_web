"use client";

import { plural } from "@/utils/format/plural";
import { Alert } from "@/components/Alert";
import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Divider } from "@/components/Divider";
import { Grid } from "@/components/Grid";
import { Input } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Progress } from "@/components/Progress";
import { QueryError } from "@/components/QueryError";
import { Stepper } from "@/components/Stepper";
import { Title } from "@/components/Title";
import { ThemeColor } from "@/lib/theme";
import { ArrowLeftRight, Info, X } from "lucide-react";
import { useState } from "react";

import { CreateMissingOptions } from "../../../_components/CreateMissingOptions";
import { MatchOption } from "../../../interface";
import { STATUS_OPTIONS } from "../../../utils";
import {
  PdfDefaults,
  PdfFileOverride,
  PdfImportBatch,
  PdfImportFile,
  PdfUploadState,
} from "../../interface";
import {
  fileBlocker,
  freePdfSlots,
  MAX_PDF_FILES,
  MAX_PDF_SIZE_MB,
  pickedId,
  toSelect,
} from "../../utils";
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
  defaults: PdfDefaults;
  onDefaults: (change: Partial<PdfDefaults>) => void;
  rowsCount: number;
  createClients: boolean;
  onCreateClients: (value: boolean) => void;
  createProducts: boolean;
  onCreateProducts: (value: boolean) => void;
  disabled: boolean;
  /** Volta ao passo 1 para trocar a fábrica; ausente quando ela já não muda. */
  onChangeFactory?: () => void;
}

/** Passo 2: sobe os PDFs, mostra o que foi lido de cada um e o que falta acertar. */
export function StepFiles(props: Props) {
  const [current, setCurrent] = useState(0);
  if (props.loading) return <Loading.Skeleton className="h-[200px] w-full" />;
  if (props.error || !props.batch) {
    return <QueryError flat onRetry={props.onRetry} />;
  }

  const imported = props.files.filter((f) => f.status === "IMPORTED").length;
  const open = props.files.filter((f) => f.status !== "IMPORTED");
  const sendingNow = props.sending && props.progress.total > 0;
  const slots = freePdfSlots(props.files);
  const readCount = open.filter((f) => f.status === "READ").length;
  // "Do cliente" fica como opção de verdade (valor vazio = nulo), e não como
  // campo limpo: é a escolha certa quando cada cliente tem o seu vendedor.
  const sellers = [
    { value: "", label: "O vendedor de cada cliente" },
    ...toSelect(props.sellerOptions),
  ];
  const statuses = toSelect(STATUS_OPTIONS);
  // Um PDF por vez: o índice se acomoda quando um sai ou entra no lote.
  const index = Math.min(current, Math.max(open.length - 1, 0));
  const shown = open[index];
  const tally = openTally(open, props.overrides, props.defaults);

  return (
    <div className="flex flex-col gap-12">
      <Stepper.Intro step={2} total={3} title="Envie os PDFs">
        Escolha os PDFs dos pedidos de {props.batch.factoryName}, até{" "}
        {MAX_PDF_FILES} por vez. Cada um é lido na hora e aparece abaixo para
        você conferir cliente, vendedor e situação; nada é gravado antes de
        importar. O mesmo PDF enviado duas vezes entra uma vez só.
      </Stepper.Intro>

      <div className="flex flex-wrap items-center gap-8">
        <Title variant="body-sm" color="muted">
          Fábrica do lote:
        </Title>
        <Title variant="body-sm" weight="medium">
          {props.batch.factoryName}
        </Title>
        {props.onChangeFactory && (
          <Button.Root
            appearance="ghost"
            color="neutral"
            size="sm"
            disabled={props.disabled || props.sending}
            onClick={props.onChangeFactory}
          >
            <Button.Icon icon={ArrowLeftRight} />
            <Button.Title>Trocar fábrica</Button.Title>
          </Button.Root>
        )}
      </div>

      <Input.Archive
        variant="multi"
        label="PDFs dos pedidos"
        hint={
          slots > 0
            ? `Cabem mais ${plural(slots, "PDF", "PDFs")} neste lote, de até ${MAX_PDF_SIZE_MB} MB cada.`
            : `O lote já tem ${MAX_PDF_FILES} PDFs esperando. Importe-os (ou exclua os que não vão entrar) para enviar mais.`
        }
        accept=".pdf,application/pdf"
        value={[]}
        maxFiles={Math.max(slots, 1)}
        maxSizeMb={MAX_PDF_SIZE_MB}
        disabled={props.disabled || slots === 0}
        onChange={props.onAdd}
      />

      {sendingNow && (
        <div className="flex flex-col gap-4">
          <Title variant="body-xs" color="muted">
            Enviando {props.progress.done} de{" "}
            {plural(props.progress.total, "PDF", "PDFs")}…
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
              {plural(props.failed.length, "PDF não subiu", "PDFs não subiram")}
              :{" "}
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
          {plural(
            imported,
            "PDF deste lote já foi importado",
            "PDFs deste lote já foram importados"
          )}
          .
        </Title>
      )}

      {!props.sending &&
        !props.reading &&
        open.length > 0 &&
        props.rowsCount === 0 && (
          <Alert.Root variant="warning">
            <Alert.Icon icon={Info} />
            <Alert.Content>
              <Alert.Description>
                Nenhum PDF pronto para importar. Acerte os avisos de cada PDF
                abaixo ou envie outros PDFs.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}

      {readCount > 0 && (
        <Card.Root inset tone="transparent">
          <Card.Body padding="sm">
            <Title variant="micro" color="muted">
              Para todos os PDFs
            </Title>
            <Title variant="body-xs" color="muted">
              Vale para cada PDF abaixo, a não ser que você troque nele. Com a
              nota fiscal no PDF, &quot;Confirmado&quot; e &quot;Enviado à
              fábrica&quot; entram como faturado.
            </Title>
            <Grid.Root cols={{ base: 1, tablet: 2 }} gap={12}>
              <Input.Select
                label="Vendedor"
                placeholder="Escolha o vendedor"
                variant="single"
                options={sellers}
                value={
                  sellers.find(
                    (o) => o.value === (props.defaults.sellerId ?? "")
                  ) ?? null
                }
                disabled={props.disabled}
                onChange={(val) =>
                  props.onDefaults({ sellerId: pickedId(val) })
                }
              />
              <Input.Select
                label="Situação dos pedidos"
                required
                placeholder="Escolha a situação"
                variant="single"
                options={statuses}
                value={
                  statuses.find((o) => o.value === props.defaults.status) ??
                  null
                }
                disabled={props.disabled}
                onChange={(val) => {
                  const id = pickedId(val);
                  if (id)
                    props.onDefaults({
                      status: id as PdfDefaults["status"],
                    });
                }}
              />
            </Grid.Root>
          </Card.Body>
        </Card.Root>
      )}

      {shown && (
        <div className="flex flex-col gap-12">
          <Divider.Root />
          <div className="flex flex-wrap items-center justify-between gap-8">
            <div className="flex flex-wrap items-center gap-8">
              <Title variant="heading-sm">
                Conferir PDF {index + 1} de {open.length}
              </Title>
              {tally.map((t) => (
                <Badge.Root key={t.label} color={t.color} size="sm">
                  <Badge.Text>{t.label}</Badge.Text>
                </Badge.Root>
              ))}
            </div>
            {open.length > 1 && (
              <Pagination.Smart
                currentPage={index + 1}
                totalPages={open.length}
                onPageChange={(page) => setCurrent(page - 1)}
              />
            )}
          </div>
          <PdfFileRow
            key={shown.id}
            batchId={props.batch.id}
            defaults={props.defaults}
            file={shown}
            override={props.overrides[shown.id]}
            onOverride={(change) => props.onOverride(shown.id, change)}
            sellerOptions={props.sellerOptions}
            canResend={props.canResend(shown.fileName)}
            onResend={() => props.onResend(shown.fileName)}
            disabled={props.disabled}
          />
        </div>
      )}

      {open.length > 0 && <Divider.Root />}
      {open.length > 0 && (
        <CreateMissingOptions
          createClients={props.createClients}
          onCreateClients={props.onCreateClients}
          createProducts={props.createProducts}
          onCreateProducts={props.onCreateProducts}
        />
      )}
    </div>
  );
}

/** "3 prontos · 1 precisa de acerto · 1 não lido": o lote num relance, em selos. */
function openTally(
  open: PdfImportFile[],
  overrides: Record<string, PdfFileOverride>,
  defaults: PdfDefaults
): { label: string; color: ThemeColor }[] {
  let ready = 0;
  let pending = 0;
  let reading = 0;
  let failed = 0;
  for (const file of open) {
    const override = overrides[file.id];
    if (file.status === "FAILED") failed += 1;
    else if (file.status === "PENDING") reading += 1;
    else if (fileBlocker(defaults, file, override)) pending += 1;
    else ready += 1;
  }
  const parts: { count: number; label: string; color: ThemeColor }[] = [
    { count: ready, label: plural(ready, "pronto", "prontos"), color: "green" },
    {
      count: pending,
      label: plural(pending, "precisa de acerto", "precisam de acerto"),
      color: "warning",
    },
    {
      count: reading,
      label: plural(reading, "sendo lido", "sendo lidos"),
      color: "blue",
    },
    {
      count: failed,
      label: plural(failed, "não lido", "não lidos"),
      color: "red",
    },
  ];
  return parts
    .filter((p) => p.count > 0)
    .map(({ label, color }) => ({ label, color }));
}
