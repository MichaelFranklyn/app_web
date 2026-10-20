"use client";

import { Input, SelectOption } from "@/components/Input";

import { reasonOptions } from "./utils";

const pick = (options: SelectOption[], value: string | null) =>
  options.find((o) => o.value === value) ?? null;

const single = (val: SelectOption | SelectOption[] | null) =>
  Array.isArray(val) ? (val[0] ?? null) : val;

interface Props {
  reason: string | null;
  onReason: (value: string | null) => void;
  notes: string;
  onNotes: (value: string) => void;
}

/**
 * O combinado com o cliente: por que voltar e o que lembrar. Opcional — sem
 * motivo, a parada é só a visita ou a ligação.
 */
export function AgreementFields({ reason, onReason, notes, onNotes }: Props) {
  const options = reasonOptions(reason);

  return (
    <>
      <Input.Select
        label="Motivo"
        hint="Aparece na agenda e no lembrete."
        placeholder="Escolha o motivo, se quiser"
        options={options}
        value={pick(options, reason)}
        variant="single"
        onChange={(val) => onReason(single(val)?.value ?? null)}
      />
      <Input.Textarea
        label="Observações"
        placeholder="Ex: Falar com a Dona Maria, que decide as compras. Ela prefere de manhã."
        value={notes}
        rows={3}
        onChange={(e) => onNotes(e.target.value)}
      />
    </>
  );
}
