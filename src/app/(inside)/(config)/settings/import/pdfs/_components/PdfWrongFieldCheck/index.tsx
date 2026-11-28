"use client";

import { Input } from "@/components/Input";
import { Title } from "@/components/Title";

interface Props {
  id: string;
  label: string;
  /** O que a leitura achou; nulo se não achou nada. */
  readValue: string | null;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Sem placeholder, o campo só se marca (não há valor para digitar). */
  placeholder?: string;
  value: string;
  onValueChange: (value: string) => void;
}

/**
 * Um campo lido do PDF que a pessoa marca como errado. Marcado, abre o
 * "Valor correto": com ele, o back acha o valor no PDF e aprende onde ele fica
 * nos próximos PDFs da fábrica.
 */
export function PdfWrongFieldCheck({
  id,
  label,
  readValue,
  checked,
  onCheckedChange,
  placeholder,
  value,
  onValueChange,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <Input.Checkbox
        id={`${id}-check`}
        label={label}
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
      />
      <Title variant="caption" color="muted" className="pl-24">
        {readValue ? `O sistema leu: ${readValue}` : "O sistema não achou"}
      </Title>
      {checked && placeholder && (
        <Input.Text
          id={`${id}-value`}
          containerClassName="pl-24"
          label="Valor correto"
          placeholder={placeholder}
          hint="Com ele, aprendemos onde esse valor fica nos PDFs desta fábrica."
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
        />
      )}
    </div>
  );
}
