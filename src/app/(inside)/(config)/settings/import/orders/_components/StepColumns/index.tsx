"use client";

import { Alert } from "@/components/Alert";
import { Import } from "@/components/Import";
import { Stepper } from "@/components/Stepper";
import { Title } from "@/components/Title";
import { ToggleGroup } from "@/components/ToggleGroup";
import { Info } from "lucide-react";

import { HistoryMapping, QuantityUnit } from "../../interface";
import { HISTORY_FIELDS, missingFields } from "../../utils";

interface Props {
  headers: string[];
  mapping: HistoryMapping;
  onMappingChange: (mapping: HistoryMapping) => void;
  quantityUnit: QuantityUnit;
  onQuantityUnitChange: (unit: QuantityUnit) => void;
}

const UNIT_OPTIONS = [
  { value: "UNITS" as const, label: "Em unidades" },
  { value: "PACKS" as const, label: "Em caixas / embalagens" },
];

export function StepColumns({
  headers,
  mapping,
  onMappingChange,
  quantityUnit,
  onQuantityUnitChange,
}: Props) {
  const missing = missingFields(mapping);

  return (
    <div className="flex flex-col gap-12">
      <Stepper.Intro
        step={2}
        total={4}
        title="Confira de onde vem cada informação"
      >
        O sistema já escolheu a coluna de cada campo pelos títulos da planilha.
        Confira e troque o que não estiver certo. Campos sem coluna ficam em
        branco.
      </Stepper.Intro>
      {missing.length > 0 && (
        <Alert.Root variant="warning">
          <Alert.Icon icon={Info} />
          <Alert.Content>
            <Alert.Description>
              Falta escolher a coluna de: {missing.join(", ")}.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      {HISTORY_FIELDS.map((field) => (
        <Import.FieldMapper
          key={field.key}
          label={field.required ? `${field.label} *` : field.label}
          headers={headers}
          choice={mapping[field.key]}
          help={field.help}
          onChange={(choice) =>
            onMappingChange({ ...mapping, [field.key]: choice })
          }
        />
      ))}
      <div className="flex flex-col gap-6">
        <Title variant="body-sm" weight="medium">
          A quantidade da planilha está contada:
        </Title>
        <ToggleGroup
          options={UNIT_OPTIONS}
          value={quantityUnit}
          onChange={onQuantityUnitChange}
          aria-label="Em que a quantidade está contada"
        />
        <Title variant="caption" color="muted">
          Aqui o pedido conta em unidades. Se a planilha fala em caixas, o
          sistema multiplica pela quantidade de cada caixa do produto.
        </Title>
      </div>
    </div>
  );
}
