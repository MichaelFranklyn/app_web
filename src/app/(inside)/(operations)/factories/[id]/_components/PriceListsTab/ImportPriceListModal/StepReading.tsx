import { Alert } from "@/components/Alert";
import { HelpTooltip } from "@/components/HelpTooltip";
import { SheetPreview } from "@/components/Import";
import { Input } from "@/components/Input";
import { SelectOption } from "@/components/Input/InputSelect";
import { Stepper } from "@/components/Stepper";
import { Title } from "@/components/Title";
import { SheetMatrix, WorkbookData } from "@/utils/import/reader";
import { Info } from "lucide-react";
import { ComponentProps } from "react";

type SheetData = ComponentProps<typeof SheetPreview>["data"];

interface StepReadingProps {
  matrix: SheetMatrix;
  data: SheetData;
  workbook: WorkbookData | null;
  sheetName: string | null;
  sheetOptions: SelectOption[];
  onSheetChange: (name: string) => void;
  headerOptions: SelectOption[];
  headerIndex: number;
  applyHeader: (source: SheetMatrix, index: number) => void;
  unreadable: string[];
}

export function StepReading({
  matrix,
  data,
  workbook,
  sheetName,
  sheetOptions,
  onSheetChange,
  headerOptions,
  headerIndex,
  applyHeader,
  unreadable,
}: StepReadingProps) {
  return (
    <div className="flex flex-col gap-12">
      <Stepper.Intro
        step={2}
        total={6}
        title="Veja o que o sistema entendeu da planilha"
      >
        O arquivo foi lido: encontramos {data.rows.length} linha(s) de produtos
        {workbook && workbook.sheetNames.length > 1 && sheetName
          ? ` na aba "${sheetName}"`
          : ""}
        . A tabela abaixo mostra uma amostra das primeiras linhas, do jeito que
        o sistema enxergou. Compare com o Excel: se as colunas estiverem certas,
        clique em Próximo. Se aparecer estranho, ajuste a aba ou a linha do
        cabeçalho aqui embaixo.
      </Stepper.Intro>
      {unreadable.length > 0 && (
        <Alert.Root variant="warning">
          <Alert.Icon icon={Info} />
          <Alert.Content>
            <Alert.Title>
              {unreadable.length} linha(s) do PDF não puderam ser lidas
            </Alert.Title>
            <Alert.Description>
              O código destes produtos saiu embaralhado no PDF (texto
              sobreposto) e eles NÃO entram na importação. Confira a descrição,
              ache o código no PDF e cadastre-os manualmente:
              <ul className="mt-4 list-disc pl-16">
                {unreadable.map((desc, i) => (
                  <li key={`${desc}-${i}`}>{desc}</li>
                ))}
              </ul>
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      {workbook && workbook.sheetNames.length > 1 && (
        <div className="grid grid-cols-[190px_1fr] items-center gap-8">
          <span className="inline-flex items-center gap-4 whitespace-nowrap">
            <Title variant="body-sm" weight="medium">
              Aba da planilha
            </Title>
            <HelpTooltip
              label="Qual aba escolher?"
              content="O arquivo tem mais de uma aba. Escolha a que contém a tabela de preço (geralmente a com mais linhas) — abas de formulário de pedido ou ajustes não servem para importação. Trocar a aba refaz os palpites de cabeçalho e colunas."
              position="right"
            />
          </span>
          <Input.Select
            options={sheetOptions}
            value={sheetOptions.find((o) => o.value === sheetName) ?? null}
            variant="single"
            disabledClear
            onChange={(val: SelectOption | SelectOption[] | null) => {
              const opt = Array.isArray(val) ? val[0] : val;
              if (opt) onSheetChange(String(opt.value));
            }}
          />
        </div>
      )}
      <div className="grid grid-cols-[190px_1fr] items-center gap-8">
        <span className="inline-flex items-center gap-4 whitespace-nowrap">
          <Title variant="body-sm" weight="medium">
            Linha do cabeçalho
          </Title>
          <HelpTooltip
            label="O que é a linha do cabeçalho?"
            content="É a linha da planilha onde estão os títulos das colunas (Código, Descrição, Preço…). O sistema já escolheu a mais provável — só mude aqui se a tabela de exemplo logo abaixo aparecer errada."
            position="right"
          />
        </span>
        <Input.Select
          options={headerOptions}
          value={
            headerOptions.find((o) => o.value === String(headerIndex)) ?? null
          }
          variant="single"
          disabledClear
          onChange={(val: SelectOption | SelectOption[] | null) => {
            const opt = Array.isArray(val) ? val[0] : val;
            if (opt) applyHeader(matrix, Number(opt.value));
          }}
        />
      </div>
      <SheetPreview data={data} />
      <Title variant="caption" color="muted">
        {data.rows.length} linha(s) de dados.
      </Title>
    </div>
  );
}
