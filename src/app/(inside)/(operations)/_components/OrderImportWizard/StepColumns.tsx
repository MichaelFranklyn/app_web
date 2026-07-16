import { FieldMapper, SheetPreview } from "@/components/Import";
import { Input } from "@/components/Input";
import { SelectOption } from "@/components/Input";
import { Stepper } from "@/components/Stepper";
import { Title } from "@/components/Title";
import { ComponentProps, Dispatch, SetStateAction } from "react";

import { Mapping } from "./interface";

type SheetData = ComponentProps<typeof SheetPreview>["data"];

interface StepColumnsProps {
  data: SheetData;
  headerOptions: SelectOption[];
  headerIndex: number;
  onHeaderChange: (index: number) => void;
  mapping: Mapping;
  setMapping: Dispatch<SetStateAction<Mapping>>;
  /** Fábrica cobra IPI no pedido: mostra o mapeamento da coluna de IPI. */
  ipiInOrder?: boolean;
}

export function StepColumns({
  data,
  headerOptions,
  headerIndex,
  onHeaderChange,
  mapping,
  setMapping,
  ipiInOrder = false,
}: StepColumnsProps) {
  return (
    <div className="flex flex-col gap-12">
      <Stepper.Intro step={2} total={4} title="Aponte as colunas do pedido">
        Diga em qual coluna está o código do produto, a quantidade e — se houver
        — o preço. Confira a amostra abaixo; se as colunas estiverem deslocadas,
        ajuste a linha do cabeçalho.
      </Stepper.Intro>
      <div className="grid grid-cols-[190px_1fr] items-center gap-8">
        <Title variant="body-sm" weight="medium">
          Linha do cabeçalho
        </Title>
        <Input.Select
          options={headerOptions}
          value={
            headerOptions.find((o) => o.value === String(headerIndex)) ?? null
          }
          variant="single"
          disabledClear
          onChange={(val: SelectOption | SelectOption[] | null) => {
            const opt = Array.isArray(val) ? val[0] : val;
            if (opt) onHeaderChange(Number(opt.value));
          }}
        />
      </div>
      <SheetPreview data={data} />
      <FieldMapper
        label="Código do produto"
        help="Coluna com o código do produto na fábrica, usado para casar com o catálogo."
        headers={data.headers}
        choice={mapping.sku}
        onChange={(choice) => setMapping((p) => ({ ...p, sku: choice }))}
      />
      <FieldMapper
        label="Quantidade"
        help="Quantidade pedida, em unidades (peças), como vem no arquivo da fábrica."
        headers={data.headers}
        choice={mapping.quantity}
        onChange={(choice) => setMapping((p) => ({ ...p, quantity: choice }))}
      />
      <FieldMapper
        label="Preço (opcional)"
        help="Preço por unidade no pedido. Sem mapear, usamos o preço por unidade da tabela ativa da fábrica."
        headers={data.headers}
        choice={mapping.unitPrice}
        onChange={(choice) => setMapping((p) => ({ ...p, unitPrice: choice }))}
      />
      {ipiInOrder && (
        <FieldMapper
          label="Alíq. IPI (%) (opcional)"
          help="Coluna com a alíquota de IPI de cada item (ex.: 3,25%). Linhas sem IPI (---) entram como 0."
          headers={data.headers}
          choice={mapping.ipiRate}
          onChange={(choice) => setMapping((p) => ({ ...p, ipiRate: choice }))}
        />
      )}
    </div>
  );
}
