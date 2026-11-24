"use client";

import { Alert } from "@/components/Alert";
import { ChoiceCardGroup, ChoiceCardOption } from "@/components/ChoiceCard";
import { Input, SelectOption } from "@/components/Input";
import { Title } from "@/components/Title";
import { ToggleGroup, ToggleOption } from "@/components/ToggleGroup";
import { Calculator } from "lucide-react";

import {
  Direction,
  PricingKind,
  TierFormErrors,
  TierFormValues,
  examplePrice,
} from "../utils";

const KIND_OPTIONS: ChoiceCardOption<PricingKind>[] = [
  {
    value: "own",
    label: "Preço próprio",
    hint: "Cada produto tem o seu preço, vindo da planilha da fábrica.",
  },
  {
    value: "percent",
    label: "Percentual sobre outro nível",
    hint: "Ex.: Diamante = Gold com 10% de desconto. Sem planilha.",
  },
];

const DIRECTION_OPTIONS: ToggleOption<Direction>[] = [
  { value: "down", label: "Desconto" },
  { value: "up", label: "Acréscimo" },
];

const brl = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface Props {
  values: TierFormValues;
  onChange: (values: TierFormValues) => void;
  /** Mostrados só depois da 1ª tentativa de salvar. */
  errors: TierFormErrors;
  baseOptions: SelectOption[];
  /** Níveis calculados sobre este: enquanto existirem, ele tem preço próprio. */
  dependents?: string[];
  /** Edição de um calculado que volta a ter preço próprio. */
  leavingPercent?: boolean;
}

/**
 * Nome + como o preço do nível é definido. Input direto (não FormBuilder): os
 * campos do percentual só existem na escolha "percentual" e a prévia do preço
 * muda a cada tecla — conteúdo reativo entre campos.
 */
export function TierForm({
  values,
  onChange,
  errors,
  baseOptions,
  dependents = [],
  leavingPercent = false,
}: Props) {
  const set = <K extends keyof TierFormValues>(
    key: K,
    value: TierFormValues[K]
  ) => onChange({ ...values, [key]: value });
  const base = baseOptions.find((o) => o.value === values.baseTierId) ?? null;
  const example = examplePrice(values);
  const tierName = values.name.trim() || "este nível";

  return (
    <div className="flex flex-col gap-16">
      <Input.Text
        label="Nome do nível"
        required
        placeholder="Ex: Varejo, Atacado, Gold, Diamante"
        value={values.name}
        onChange={(e) => set("name", e.target.value)}
        error={errors.name}
      />

      {dependents.length > 0 ? (
        <Title variant="body-sm" color="muted">
          {dependents.join(", ")}{" "}
          {dependents.length === 1 ? "é calculado" : "são calculados"} sobre
          este nível, então ele continua com preço próprio.
        </Title>
      ) : (
        <ChoiceCardGroup
          aria-label="Como o preço deste nível é definido"
          options={KIND_OPTIONS}
          value={values.kind}
          onChange={(kind) => set("kind", kind)}
        />
      )}

      {values.kind === "percent" && (
        <>
          <Input.Select
            label="Nível de referência"
            required
            placeholder="Escolha o nível"
            searchable={false}
            options={baseOptions}
            value={base}
            onChange={(v) => {
              const picked = Array.isArray(v) ? v[0] : v;
              set("baseTierId", (picked as SelectOption | null)?.value ?? null);
            }}
            error={errors.baseTierId}
            hint={
              baseOptions.length === 0
                ? "Crie antes um nível com preço próprio para servir de referência."
                : undefined
            }
          />

          <ToggleGroup
            aria-label="Desconto ou acréscimo"
            options={DIRECTION_OPTIONS}
            value={values.direction}
            onChange={(direction) => set("direction", direction)}
            fullWidth
          />

          <Input.Text
            label="Percentual"
            required
            inputMode="decimal"
            placeholder="Ex: 10"
            addon="%"
            value={values.percent}
            onChange={(e) =>
              set("percent", e.target.value.replace(/[^\d.,]/g, ""))
            }
            error={errors.percent}
          />

          {base && example != null && (
            <Alert.Root variant="info">
              <Alert.Icon icon={Calculator} />
              <Alert.Content>
                <Alert.Title>
                  Produto de {brl(100)} no {base.label} sai por {brl(example)}{" "}
                  no {tierName}
                </Alert.Title>
                <Alert.Description>
                  Os preços são refeitos sozinhos sempre que o {base.label}{" "}
                  mudar — pela planilha, pela tela ou pela promoção. Não dá para
                  editar o preço deste nível à mão.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}
        </>
      )}

      {leavingPercent && values.kind === "own" && (
        <Title variant="body-sm" color="muted">
          Os preços que o nível já tem continuam valendo e passam a ser editados
          à mão (ou pela planilha).
        </Title>
      )}
    </div>
  );
}
