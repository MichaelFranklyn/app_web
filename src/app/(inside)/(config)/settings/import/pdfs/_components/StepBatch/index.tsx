"use client";

import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { QueryError } from "@/components/QueryError";
import { Stepper } from "@/components/Stepper";
import { Title } from "@/components/Title";
import { plural } from "@/utils/format/plural";

import { MatchOption } from "../../../interface";
import { PdfImportBatch } from "../../interface";
import { MAX_PDF_FILES, pickedId, toSelect } from "../../utils";

interface Props {
  batch: PdfImportBatch | null;
  batchLoading: boolean;
  factoryOptions: MatchOption[];
  optionsLoading: boolean;
  optionsError: Error | null;
  onRetry: () => void;
  factoryId: string | null;
  onFactory: (id: string | null) => void;
  /** O lote já tem pedido importado: a fábrica não muda mais. */
  factoryLocked: boolean;
  /** A fábrica escolhida difere da do lote aberto. */
  factoryChanged: boolean;
  disabled: boolean;
}

/** O aviso sob a fábrica de um lote já aberto. */
function factoryHint(batch: PdfImportBatch, changed: boolean) {
  if (batch.totalFiles === 0) return undefined;
  const files = plural(batch.totalFiles, "PDF enviado", "PDFs enviados");
  return changed
    ? `Ao avançar, ${files} ${batch.totalFiles === 1 ? "é lido" : "são lidos"} de novo com a nova fábrica, e os acertos da prévia recomeçam.`
    : `Lote com ${files}. Trocar a fábrica faz a leitura de novo.`;
}

/**
 * Passo 1: de que fábrica são os PDFs. Vendedor e situação vêm na prévia. Num
 * lote já aberto a fábrica ainda pode mudar, até o primeiro pedido importado.
 */
export function StepBatch(props: Props) {
  const intro = (
    <Stepper.Intro step={1} total={3} title="Abra o lote">
      Cada lote é de uma fábrica e recebe até {MAX_PDF_FILES} PDFs por vez.
      Vendedor, situação e cliente você confere depois, na prévia de cada PDF,
      antes de gravar qualquer pedido.
    </Stepper.Intro>
  );

  if (props.batchLoading) {
    return <Loading.Skeleton className="h-[160px] w-full" />;
  }

  if (props.batch && props.factoryLocked) {
    return (
      <div className="flex flex-col gap-12">
        {intro}
        <Card.Root inset tone="transparent">
          <Card.Body padding="sm">
            <Title variant="body-sm" weight="medium">
              {props.batch.factoryName}
            </Title>
            <Title variant="body-xs" color="muted">
              {plural(props.batch.totalFiles, "PDF", "PDFs")} no lote,{" "}
              {plural(
                props.batch.importedFiles,
                "já importado",
                "já importados"
              )}
              . Com pedido importado, a fábrica do lote não muda mais.
            </Title>
          </Card.Body>
        </Card.Root>
      </div>
    );
  }

  if (props.optionsLoading && props.factoryOptions.length === 0) {
    return <Loading.Skeleton className="h-[200px] w-full" />;
  }
  if (props.optionsError && props.factoryOptions.length === 0) {
    return <QueryError flat onRetry={props.onRetry} />;
  }

  const factories = toSelect(props.factoryOptions);
  return (
    <div className="flex flex-col gap-12">
      {intro}
      <Input.Select
        label="Fábrica"
        required
        placeholder="Escolha a fábrica dos PDFs"
        variant="single"
        options={factories}
        value={factories.find((o) => o.value === props.factoryId) ?? null}
        disabled={props.disabled}
        disabledClear={Boolean(props.batch)}
        hint={
          props.batch
            ? factoryHint(props.batch, props.factoryChanged)
            : undefined
        }
        onChange={(val) => props.onFactory(pickedId(val))}
      />
    </div>
  );
}
