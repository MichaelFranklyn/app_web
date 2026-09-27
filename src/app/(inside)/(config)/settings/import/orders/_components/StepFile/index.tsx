"use client";

import { Alert } from "@/components/Alert";
import { HelpTooltip } from "@/components/HelpTooltip";
import { SheetPreview } from "@/components/Import";
import { Input, SelectOption } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { Stepper } from "@/components/Stepper";
import { Title } from "@/components/Title";
import { SheetData, SheetMatrix } from "@/utils/import/reader";
import { TriangleAlert } from "lucide-react";

interface Props {
  files: File[];
  onFiles: (files: File[]) => void;
  reading: boolean;
  readError: string | null;
  matrix: SheetMatrix;
  headerIndex: number;
  onHeaderChange: (index: number) => void;
  data: SheetData;
}

export function StepFile({
  files,
  onFiles,
  reading,
  readError,
  matrix,
  headerIndex,
  onHeaderChange,
  data,
}: Props) {
  const headerOptions: SelectOption[] = matrix.slice(0, 15).map((row, i) => ({
    value: String(i),
    label: `Linha ${i + 1}: ${row.filter(Boolean).slice(0, 4).join(" · ")}`,
  }));

  return (
    <div className="flex flex-col gap-12">
      <Stepper.Intro step={1} total={4} title="Envie a planilha de pedidos">
        No sistema que você usava antes, exporte o relatório de pedidos com os
        itens (uma linha por produto) em Excel. Depois, arraste o arquivo para o
        quadro abaixo.
      </Stepper.Intro>
      <Input.Archive
        variant="single"
        accept=".csv,.xlsx,.xls"
        hint="Planilha Excel (.xlsx) ou CSV, com uma linha por produto de cada pedido."
        value={files}
        disabled={reading}
        onChange={onFiles}
      />
      {reading && <Loading.Skeleton className="h-[120px] w-full" />}
      {readError && (
        <Alert.Root variant="error">
          <Alert.Icon icon={TriangleAlert} />
          <Alert.Content>
            <Alert.Description>{readError}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      {matrix.length > 0 && (
        <>
          <div className="grid grid-cols-[190px_1fr] items-center gap-8">
            <span className="inline-flex items-center gap-4 whitespace-nowrap">
              <Title variant="body-sm" weight="medium">
                Linha do cabeçalho
              </Title>
              <HelpTooltip
                label="O que é a linha do cabeçalho?"
                content="É a linha onde estão os títulos das colunas (Data, Cliente, Produto…). O sistema já escolheu a mais provável: só mude se a amostra abaixo aparecer errada."
                position="right"
              />
            </span>
            <Input.Select
              placeholder="Escolha a linha do cabeçalho"
              options={headerOptions}
              value={headerOptions[headerIndex] ?? null}
              variant="single"
              disabledClear
              onChange={(val: SelectOption | SelectOption[] | null) => {
                const opt = Array.isArray(val) ? val[0] : val;
                if (opt) onHeaderChange(Number(opt.value));
              }}
            />
          </div>
          <Title variant="body-sm" color="muted">
            Encontramos {data.rows.length} linha(s) de itens. Amostra:
          </Title>
          <SheetPreview data={data} />
        </>
      )}
    </div>
  );
}
