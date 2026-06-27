import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { FieldMapper } from "@/components/Import";
import { Input } from "@/components/Input";
import { Stepper } from "@/components/Stepper";
import { Title } from "@/components/Title";
import { ColumnChoice } from "@/utils/import/columns";

import { hasConfiguredTaxes } from "./build";
import { TaxColumn } from "./interface";
import {
  isStMvaComplete,
  isStMvaPartial,
  StMvaChoices,
  StMvaFields,
} from "./StMvaFields";
import { TaxMapper } from "./TaxMapper";

interface StepTaxesProps {
  headers: string[];
  ipiChoice: ColumnChoice;
  onIpiChoice: (choice: ColumnChoice) => void;
  ipiAsFraction: boolean;
  setIpiAsFraction: (value: boolean) => void;
  taxColumns: TaxColumn[];
  setTaxColumns: (taxes: TaxColumn[]) => void;
  validTaxesCount: number;
  stMva: StMvaChoices;
  onStMvaChange: (next: StMvaChoices) => void;
  taxesAsFraction: boolean;
  setTaxesAsFraction: (value: boolean) => void;
}

export function StepTaxes({
  headers,
  ipiChoice,
  onIpiChoice,
  ipiAsFraction,
  setIpiAsFraction,
  taxColumns,
  setTaxColumns,
  validTaxesCount,
  stMva,
  onStMvaChange,
  taxesAsFraction,
  setTaxesAsFraction,
}: StepTaxesProps) {
  return (
    <div className="flex flex-col gap-12">
      <Stepper.Intro
        step={5}
        total={6}
        title="Impostos — só se a planilha tiver"
      >
        Se a planilha da fábrica tem colunas de impostos (IPI, ST, ICMS…),
        informe aqui em qual coluna está cada um, para o sistema calcular o
        preço final com imposto. Se a planilha não traz impostos, ou se você não
        tem certeza, pode pular este passo e seguir em frente — dá para
        configurar depois.
      </Stepper.Intro>

      <Card.Root>
        <Card.Header>
          <Card.Header.Title size="sm" weight="bold">
            IPI
          </Card.Header.Title>
          <Card.Header.Actions>
            <Badge.Root
              color={ipiChoice.kind !== "none" ? "green" : "neutral"}
              appearance="tinted"
            >
              <Badge.Text>
                {ipiChoice.kind !== "none" ? "Mapeado" : "Não usado"}
              </Badge.Text>
            </Badge.Root>
          </Card.Header.Actions>
        </Card.Header>
        <Card.Body padding="compact" className="flex flex-col gap-12">
          <FieldMapper
            label="Coluna do IPI"
            help="Alíquota de IPI de cada produto, gravada como imposto do produto."
            headers={headers}
            choice={ipiChoice}
            onChange={onIpiChoice}
          />
          {ipiChoice.kind !== "none" && (
            <div className="flex flex-col gap-8 rounded-md border border-(--border) bg-(--bg2) p-12">
              <Title variant="caption" color="muted">
                O IPI da planilha está em:
              </Title>
              <Input.Radio
                name="ipiSemantics"
                checked={!ipiAsFraction}
                onChange={() => setIpiAsFraction(false)}
                label="Percentual (ex.: 3,25 = 3,25%) — usado como está"
              />
              <Input.Radio
                name="ipiSemantics"
                checked={ipiAsFraction}
                onChange={() => setIpiAsFraction(true)}
                label="Fração decimal (ex.: 0,0325 = 3,25%) — convertemos multiplicando por 100"
              />
            </div>
          )}
        </Card.Body>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <Card.Header.Title size="sm" weight="bold">
            Impostos de alíquota simples
          </Card.Header.Title>
          <Card.Header.Actions>
            <Badge.Root
              color={validTaxesCount > 0 ? "green" : "neutral"}
              appearance="tinted"
            >
              <Badge.Text>
                {validTaxesCount > 0
                  ? `${validTaxesCount} mapeado(s)`
                  : "Nenhum"}
              </Badge.Text>
            </Badge.Root>
          </Card.Header.Actions>
        </Card.Header>
        <Card.Body padding="compact" className="flex flex-col gap-12">
          <Title variant="caption" color="muted">
            Percentuais somados direto por cima do preço (ex.: ICMS, FECP). Cada
            coluna mapeada vira um imposto com o nome que você der.
          </Title>
          <TaxMapper
            headers={headers}
            taxes={taxColumns}
            onChange={setTaxColumns}
          />
        </Card.Body>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <Card.Header.Title size="sm" weight="bold">
            ST por MVA (substituição tributária)
          </Card.Header.Title>
          <Card.Header.Actions>
            <Badge.Root
              color={
                isStMvaComplete(stMva)
                  ? "green"
                  : isStMvaPartial(stMva)
                    ? "amber"
                    : "neutral"
              }
              appearance="tinted"
            >
              <Badge.Text>
                {isStMvaComplete(stMva)
                  ? "Configurado"
                  : isStMvaPartial(stMva)
                    ? "Incompleto — mapeie os 3 campos"
                    : "Não usado"}
              </Badge.Text>
            </Badge.Root>
          </Card.Header.Actions>
        </Card.Header>
        <Card.Body padding="compact" className="flex flex-col gap-12">
          <Title variant="caption" color="muted">
            ST calculado por margem, com o IPI na base: preço × (1+IPI) ×
            (1+MVA) × alíquota interna − preço × crédito de ICMS. Mapeie os três
            componentes; produtos com MVA zero ficam fora do regime.
          </Title>
          <StMvaFields
            headers={headers}
            value={stMva}
            onChange={onStMvaChange}
          />
        </Card.Body>
      </Card.Root>

      {hasConfiguredTaxes({ taxColumns, stMva }) && (
        <Card.Root>
          <div className="flex flex-col gap-8 p-12">
            <Title variant="caption" color="muted">
              As alíquotas desses impostos (simples e ST) estão em:
            </Title>
            <Input.Radio
              name="taxesSemantics"
              checked={!taxesAsFraction}
              onChange={() => setTaxesAsFraction(false)}
              label="Percentual (ex.: 20,5 = 20,5%) — usadas como estão"
            />
            <Input.Radio
              name="taxesSemantics"
              checked={taxesAsFraction}
              onChange={() => setTaxesAsFraction(true)}
              label="Fração decimal (ex.: 0,205 = 20,5%) — convertemos multiplicando por 100"
            />
          </div>
        </Card.Root>
      )}
    </div>
  );
}
