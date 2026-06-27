import { Card } from "@/components/Card";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Input } from "@/components/Input";
import { Stepper } from "@/components/Stepper";
import { Title } from "@/components/Title";

import { TierColumn } from "./interface";
import { TierMapper } from "./TierMapper";

interface StepPricesProps {
  headers: string[];
  tierColumns: TierColumn[];
  setTierColumns: (tiers: TierColumn[]) => void;
  pricesPerUnit: boolean;
  setPricesPerUnit: (value: boolean) => void;
}

export function StepPrices({
  headers,
  tierColumns,
  setTierColumns,
  pricesPerUnit,
  setPricesPerUnit,
}: StepPricesProps) {
  return (
    <div className="flex flex-col gap-16">
      <Stepper.Intro step={4} total={6} title="Marque as colunas que têm preço">
        Diga quais colunas da planilha trazem os preços. Se a fábrica trabalha
        com mais de um preço (ex.: DIAMANTE, PLATINA, OURO), marque uma coluna
        para cada um — cada uma vira um nível de preço no sistema. Depois,
        responda se o preço da planilha é da embalagem fechada ou de uma peça
        só.
      </Stepper.Intro>
      <TierMapper
        headers={headers}
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
    </div>
  );
}
