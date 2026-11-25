import { Card } from "@/components/Card";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Input } from "@/components/Input";
import { Stepper } from "@/components/Stepper";
import { Title } from "@/components/Title";

import { ImportMode, TierColumn } from "./interface";
import { ImportPreviewRow } from "./preview";
import { PricePreview } from "./PricePreview";
import { TierMapper } from "./TierMapper";

interface StepPricesProps {
  headers: string[];
  rows: string[][];
  mode: ImportMode;
  tierColumns: TierColumn[];
  setTierColumns: (tiers: TierColumn[]) => void;
  pricesPerUnit: boolean;
  setPricesPerUnit: (value: boolean) => void;
  previewRows: ImportPreviewRow[];
}

export function StepPrices({
  headers,
  rows,
  mode,
  tierColumns,
  setTierColumns,
  pricesPerUnit,
  setPricesPerUnit,
  previewRows,
}: StepPricesProps) {
  return (
    <div className="flex flex-col gap-16">
      {mode === "group" ? (
        <Stepper.Intro
          step={4}
          total={6}
          title="Marque a coluna com o preço deste grupo"
        >
          Diga qual coluna da planilha traz o preço do grupo de clientes (ex.:
          Interior) e dê um nome ao grupo. Depois, responda se o preço da
          planilha é da embalagem fechada ou de uma peça só. No fim da tela
          aparecem produtos da planilha com o preço calculado — confira.
        </Stepper.Intro>
      ) : (
        <Stepper.Intro
          step={4}
          total={6}
          title="Marque as colunas que têm preço"
        >
          Diga quais colunas da planilha trazem os preços. Se a fábrica trabalha
          com mais de um preço (ex.: DIAMANTE, PLATINA, OURO), marque uma coluna
          para cada um — cada uma vira um nível de preço no sistema. Depois,
          responda se o preço da planilha é da embalagem fechada ou de uma peça
          só. No fim da tela aparecem produtos da planilha com o preço calculado
          — confira.
        </Stepper.Intro>
      )}
      <TierMapper
        headers={headers}
        rows={rows}
        mode={mode}
        tiers={tierColumns}
        onChange={setTierColumns}
      />
      <Card.Root>
        <div className="flex flex-col gap-8 p-12">
          <span className="inline-flex items-center gap-4">
            <Title variant="caption" color="muted">
              Os preços da planilha são:
            </Title>
            <HelpTooltip
              label="Como saber a semântica do preço?"
              content="Na dúvida, olhe um produto conhecido: se a torneira aparece por R$ 1,41 e a caixa tem 12 peças, o preço da planilha é por unidade. O sistema sempre grava o preço da embalagem fechada — na opção 'por unidade' nós multiplicamos pelas unidades por embalagem."
              position="right"
            />
          </span>
          <Input.Radio
            name="priceSemantics"
            checked={!pricesPerUnit}
            onChange={() => setPricesPerUnit(false)}
            label="Por embalagem fechada (caixa, saco, fardo) — usados como estão"
          />
          <Input.Radio
            name="priceSemantics"
            checked={pricesPerUnit}
            onChange={() => setPricesPerUnit(true)}
            label="Por unidade (peça, kg, m²) — convertemos multiplicando pelas unidades por embalagem"
          />
        </div>
      </Card.Root>
      <PricePreview rows={previewRows} pricesPerUnit={pricesPerUnit} />
    </div>
  );
}
