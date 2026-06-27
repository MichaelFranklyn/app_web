import { Card } from "@/components/Card";
import { HelpTooltip } from "@/components/HelpTooltip";
import { FieldMapper, Reconciliation } from "@/components/Import";
import { Stepper } from "@/components/Stepper";
import { Title } from "@/components/Title";
import { ColumnChoice } from "@/utils/import/columns";
import { ComponentProps, Dispatch, SetStateAction } from "react";

import { PRICE_REQUIRED_FIELDS } from "./build";
import {
  MappingState,
  TARGET_FIELDS,
} from "../../ProductsTab/ImportProductsModal/mapping";

type ReconState = ComponentProps<typeof Reconciliation>["recon"];
type ReconChange = ComponentProps<typeof Reconciliation>["onChange"];

interface StepProductProps {
  headers: string[];
  mapping: MappingState;
  setMapping: Dispatch<SetStateAction<MappingState>>;
  ncmChoice: ColumnChoice;
  setNcmChoice: (choice: ColumnChoice) => void;
  distinctUnits: string[];
  distinctPacks: string[];
  unitLabels: string[];
  packLabels: string[];
  unitRecon: ReconState;
  setUnitFinal: ReconChange;
  packRecon: ReconState;
  setPackFinal: ReconChange;
}

export function StepProduct({
  headers,
  mapping,
  setMapping,
  ncmChoice,
  setNcmChoice,
  distinctUnits,
  distinctPacks,
  unitLabels,
  packLabels,
  unitRecon,
  setUnitFinal,
  packRecon,
  setPackFinal,
}: StepProductProps) {
  return (
    <div className="flex flex-col gap-12">
      <Stepper.Intro
        step={3}
        total={6}
        title="Confira onde estão os dados do produto"
      >
        Aqui você diz em qual coluna da planilha está o código, o nome e a
        embalagem de cada produto. O sistema já tentou adivinhar — confira se
        cada campo aponta para a coluna certa e corrija se for preciso. Em caso
        de dúvida, abra a planilha no Excel e compare.
      </Stepper.Intro>
      <Title variant="body-sm" weight="medium">
        Identificação do produto
      </Title>
      {TARGET_FIELDS.filter((field) =>
        PRICE_REQUIRED_FIELDS.includes(String(field.key))
      ).map((field) => (
        <FieldMapper
          key={field.key}
          label={field.label}
          help={field.description}
          fixedExample={field.fixedExample}
          headers={headers}
          choice={mapping[field.key] ?? { kind: "none" }}
          onChange={(choice) =>
            setMapping((p) => ({ ...p, [field.key]: choice }))
          }
        />
      ))}

      <span className="inline-flex items-center gap-4 pt-4">
        <Title variant="body-sm" weight="medium">
          Classificação (opcional)
        </Title>
        <HelpTooltip
          label="O que acontece se eu não mapear?"
          content="Muitas planilhas não trazem essas colunas. Sem mapeamento, o produto entra com categoria 'Geral', unidade 'Unidade' e embalagem 'Unidade' — dá para ajustar depois no cadastro do produto."
          position="right"
        />
      </span>
      {TARGET_FIELDS.filter(
        (field) => !PRICE_REQUIRED_FIELDS.includes(String(field.key))
      ).map((field) => (
        <FieldMapper
          key={field.key}
          label={field.label}
          help={`${field.description} Sem mapeamento, usamos o padrão do sistema.`}
          fixedExample={field.fixedExample}
          headers={headers}
          choice={mapping[field.key] ?? { kind: "none" }}
          onChange={(choice) =>
            setMapping((p) => ({ ...p, [field.key]: choice }))
          }
        />
      ))}
      <FieldMapper
        label="NCM"
        help={
          <div className="flex flex-col gap-2">
            <Title variant="label" color="amber">
              Classificação fiscal
            </Title>
            <Title variant="body-sm">
              Código de 8 dígitos que classifica a mercadoria (ex.: 3926.90.90).
              Fica no cadastro do produto e será usado quando o pedido virar
              documento fiscal (NF-e).
            </Title>
            <Title variant="body-sm" color="muted">
              Não entra no cálculo do preço — pode deixar sem mapear.
            </Title>
          </div>
        }
        headers={headers}
        choice={ncmChoice}
        onChange={setNcmChoice}
      />
      {(distinctUnits.length > 0 || distinctPacks.length > 0) && (
        <Card.Root isCompact className="flex flex-col gap-12">
          <Reconciliation
            title="Unidades"
            values={distinctUnits}
            existingLabels={unitLabels}
            recon={unitRecon}
            onChange={setUnitFinal}
          />
          <Reconciliation
            title="Rótulos de embalagem"
            values={distinctPacks}
            existingLabels={packLabels}
            recon={packRecon}
            onChange={setPackFinal}
          />
        </Card.Root>
      )}
    </div>
  );
}
