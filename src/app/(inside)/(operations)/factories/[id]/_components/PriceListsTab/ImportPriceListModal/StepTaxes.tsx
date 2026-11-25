import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { HelpTooltip } from "@/components/HelpTooltip";
import { FieldMapper } from "@/components/Import";
import { Input } from "@/components/Input";
import { Stepper } from "@/components/Stepper";
import { Title } from "@/components/Title";
import { ColumnChoice } from "@/utils/import/columns";
import { plural } from "@/utils/format/plural";
import { useState } from "react";

import { hasConfiguredTaxes } from "./build";
import { TaxColumn } from "./interface";
import { formatRateSample } from "./preview";
import {
  EMPTY_ST_MVA,
  isStMvaComplete,
  isStMvaPartial,
  StMvaChoices,
  StMvaFields,
} from "./StMvaFields";
import { TaxMapper } from "./TaxMapper";

interface StepTaxesProps {
  headers: string[];
  rows: string[][];
  /** Fábrica cobra o IPI no pedido: a coluna é importada, mas fica fora do preço. */
  ipiInOrder: boolean;
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

const ST_FORMULA =
  "Preço × (1 + IPI) × (1 + MVA) × alíquota interna − preço × crédito de ICMS. Produtos com MVA zero ficam fora do regime.";

export function StepTaxes({
  headers,
  rows,
  ipiInOrder,
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
  // Primeiro a pergunta "o que a planilha tem?"; só abre o bloco marcado. Parte
  // do que já está mapeado (palpite automático ou modelo da fábrica).
  const [has, setHas] = useState({
    ipi: ipiChoice.kind !== "none",
    simple: taxColumns.length > 0,
    st: isStMvaComplete(stMva) || isStMvaPartial(stMva),
  });

  // Desmarcar limpa o mapeamento: o que não aparece na tela não é importado.
  const toggleIpi = (on: boolean) => {
    setHas((h) => ({ ...h, ipi: on }));
    if (!on) onIpiChoice({ kind: "none" });
  };
  const toggleSimple = (on: boolean) => {
    setHas((h) => ({ ...h, simple: on }));
    if (!on) setTaxColumns([]);
  };
  const toggleSt = (on: boolean) => {
    setHas((h) => ({ ...h, st: on }));
    if (!on) onStMvaChange(EMPTY_ST_MVA);
  };

  return (
    <div className="flex flex-col gap-12">
      <Stepper.Intro
        step={5}
        total={6}
        title="Impostos — só se a planilha tiver"
      >
        Marque abaixo os impostos que aparecem como coluna na planilha da
        fábrica e diga em qual coluna está cada um. Se a planilha não traz
        impostos, ou se você não tem certeza, deixe tudo desmarcado e siga em
        frente — dá para configurar depois.
      </Stepper.Intro>

      <Card.Root>
        <div className="flex flex-col gap-8 p-12">
          <Title variant="body-sm" weight="medium">
            Quais impostos aparecem na planilha?
          </Title>
          <Input.Checkbox
            checked={has.ipi}
            onChange={(e) => toggleIpi(e.target.checked)}
            label="IPI"
          />
          <Input.Checkbox
            checked={has.simple}
            onChange={(e) => toggleSimple(e.target.checked)}
            label="ICMS, FECP ou outro imposto com uma alíquota só"
          />
          <Input.Checkbox
            checked={has.st}
            onChange={(e) => toggleSt(e.target.checked)}
            label="ST — substituição tributária (MVA, crédito de ICMS e alíquota interna)"
          />
        </div>
      </Card.Root>

      {has.ipi && (
        <Card.Root>
          <Card.Header>
            <Card.Header.Title>IPI</Card.Header.Title>
            <Card.Header.Actions>
              <Badge.Root
                color={ipiChoice.kind !== "none" ? "green" : "amber"}
                appearance="tinted"
              >
                <Badge.Text>
                  {ipiChoice.kind !== "none" ? "Mapeado" : "Escolha a coluna"}
                </Badge.Text>
              </Badge.Root>
            </Card.Header.Actions>
          </Card.Header>
          <Card.Body padding="compact">
            {ipiInOrder && (
              <Card.Root inset>
                <Card.Body padding="sm">
                  <Title variant="caption" color="secondary">
                    Esta fábrica cobra o IPI no pedido, não na tabela. Mapeie a
                    coluna assim mesmo: o IPI fica guardado em cada produto e é
                    trazido sozinho ao montar o pedido. O preço da tabela
                    continua sem IPI.
                  </Title>
                </Card.Body>
              </Card.Root>
            )}
            <FieldMapper
              label="Coluna do IPI"
              help={
                ipiInOrder
                  ? "Alíquota de IPI de cada produto. Gravada no produto e usada no pedido; não entra no preço da tabela."
                  : "Alíquota de IPI de cada produto, gravada como imposto do produto."
              }
              headers={headers}
              rows={rows}
              formatSample={(value) => formatRateSample(value, ipiAsFraction)}
              choice={ipiChoice}
              onChange={onIpiChoice}
            />
            {ipiChoice.kind !== "none" && (
              <Card.Root inset>
                <Card.Body padding="sm">
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
                </Card.Body>
              </Card.Root>
            )}
          </Card.Body>
        </Card.Root>
      )}

      {has.simple && (
        <Card.Root>
          <Card.Header>
            <Card.Header.Title>Impostos de alíquota simples</Card.Header.Title>
            <Card.Header.Actions>
              <Badge.Root
                color={validTaxesCount > 0 ? "green" : "amber"}
                appearance="tinted"
              >
                <Badge.Text>
                  {validTaxesCount > 0
                    ? plural(validTaxesCount, "mapeado", "mapeados")
                    : "Escolha a coluna"}
                </Badge.Text>
              </Badge.Root>
            </Card.Header.Actions>
          </Card.Header>
          <Card.Body padding="compact">
            <Title variant="caption" color="muted">
              Percentuais somados direto por cima do preço (ex.: ICMS, FECP).
              Clique em Adicionar imposto para cada coluna e dê um nome a ele.
            </Title>
            <TaxMapper
              headers={headers}
              rows={rows}
              asFraction={taxesAsFraction}
              taxes={taxColumns}
              onChange={setTaxColumns}
            />
          </Card.Body>
        </Card.Root>
      )}

      {has.st && (
        <Card.Root>
          <Card.Header>
            <Card.Header.Title>
              <span className="inline-flex items-center gap-4">
                ST (substituição tributária)
                <HelpTooltip
                  label="Como o ST é calculado?"
                  content={ST_FORMULA}
                  position="right"
                />
              </span>
            </Card.Header.Title>
            <Card.Header.Actions>
              <Badge.Root
                color={isStMvaComplete(stMva) ? "green" : "amber"}
                appearance="tinted"
              >
                <Badge.Text>
                  {isStMvaComplete(stMva)
                    ? "Configurado"
                    : "Escolha as 3 colunas"}
                </Badge.Text>
              </Badge.Root>
            </Card.Header.Actions>
          </Card.Header>
          <Card.Body padding="compact">
            <Title variant="caption" color="muted">
              O sistema calcula o ST de cada produto com estas três colunas.
            </Title>
            <StMvaFields
              headers={headers}
              rows={rows}
              asFraction={taxesAsFraction}
              value={stMva}
              onChange={onStMvaChange}
            />
          </Card.Body>
        </Card.Root>
      )}

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
