"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input, SelectOption } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { QueryError } from "@/components/QueryError";
import { Stepper } from "@/components/Stepper";
import { Title } from "@/components/Title";
import { FilePlus2 } from "lucide-react";

import { HistoryOrderStatus, MatchOption } from "../../../interface";
import { STATUS_OPTIONS } from "../../../utils";
import { PdfImportBatch } from "../../interface";

/** Valor do select para "o vendedor de cada cliente" (o lote vai com `null`). */
const EACH_CLIENT = "__each_client__";

interface Props {
  batch: PdfImportBatch | null;
  batchLoading: boolean;
  factoryOptions: MatchOption[];
  sellerOptions: MatchOption[];
  optionsLoading: boolean;
  optionsError: Error | null;
  onRetry: () => void;
  factoryId: string | null;
  onFactory: (id: string | null) => void;
  sellerId: string | null;
  onSeller: (id: string | null) => void;
  defaultStatus: HistoryOrderStatus;
  onStatus: (status: HistoryOrderStatus) => void;
  disabled: boolean;
  onNewBatch: () => void;
}

const toSelect = (options: MatchOption[]): SelectOption[] =>
  options.map((o) => ({ value: o.id, label: o.label }));

const picked = (val: SelectOption | SelectOption[] | null) => {
  const opt = Array.isArray(val) ? val[0] : val;
  return opt ? String(opt.value) : null;
};

const statusLabel = (status: HistoryOrderStatus) =>
  STATUS_OPTIONS.find((o) => o.id === status)?.label ?? status;

/** Passo 1: de que fábrica são os PDFs, quem vendeu e em que pé estão. */
export function StepBatch(props: Props) {
  const intro = (
    <Stepper.Intro step={1} total={3} title="Abra o lote">
      Cada lote é de uma fábrica. Escolha também o vendedor e em que pé os
      pedidos estão hoje; os PDFs com número de nota entram como faturados.
    </Stepper.Intro>
  );

  if (props.batchLoading) {
    return <Loading.Skeleton className="h-[160px] w-full" />;
  }

  if (props.batch) {
    const seller = props.batch.sellerId
      ? (props.sellerOptions.find((o) => o.id === props.batch!.sellerId)
          ?.label ?? "Vendedor escolhido")
      : "O vendedor de cada cliente";
    return (
      <div className="flex flex-col gap-12">
        {intro}
        <Card.Root inset tone="transparent">
          <Card.Body padding="sm" className="gap-6">
            <Title variant="body-sm" weight="medium">
              {props.batch.factoryName}
            </Title>
            <Title variant="body-xs" color="muted">
              {seller} · {statusLabel(props.batch.defaultStatus)}
            </Title>
            <Title variant="body-xs" color="muted">
              {props.batch.totalFiles} PDF(s) no lote,{" "}
              {props.batch.importedFiles} já importado(s).
            </Title>
          </Card.Body>
        </Card.Root>
        <div>
          <Button.Root
            appearance="outline"
            color="neutral"
            size="md"
            onClick={props.onNewBatch}
          >
            <Button.Icon icon={FilePlus2} />
            <Button.Title>Abrir outro lote</Button.Title>
          </Button.Root>
        </div>
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
  const sellers: SelectOption[] = [
    { value: EACH_CLIENT, label: "O vendedor de cada cliente" },
    ...toSelect(props.sellerOptions),
  ];
  const statuses = toSelect(STATUS_OPTIONS);

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
        onChange={(val) => props.onFactory(picked(val))}
      />
      {/* Vendedor e situação sempre têm valor (o padrão é "o vendedor de cada
          cliente" / "Entregue"): o "×" de limpar só levava a um campo vazio que
          não quer dizer nada (crítica de configurações, 23/11/2026). */}
      <Input.Select
        label="Vendedor"
        disabledClear
        placeholder="Escolha o vendedor"
        variant="single"
        options={sellers}
        value={
          sellers.find((o) => o.value === (props.sellerId ?? EACH_CLIENT)) ??
          null
        }
        hint="Com “o vendedor de cada cliente”, cada pedido vai para quem atende aquele cliente nesta fábrica."
        disabled={props.disabled}
        onChange={(val) => {
          const id = picked(val);
          props.onSeller(id === EACH_CLIENT ? null : id);
        }}
      />
      <Input.Select
        label="Situação dos pedidos"
        disabledClear
        placeholder="Escolha a situação"
        variant="single"
        options={statuses}
        value={statuses.find((o) => o.value === props.defaultStatus) ?? null}
        disabled={props.disabled}
        onChange={(val) => {
          const id = picked(val);
          if (id) props.onStatus(id as HistoryOrderStatus);
        }}
      />
    </div>
  );
}
