import { Title } from "@/components/Title";

import { ColumnChoice, sampleValues } from "@/utils/import/columns";

interface Props {
  rows: string[][];
  choice: ColumnChoice | undefined;
  /** Como mostrar cada valor (ex.: "3,25%" depois da conversão). */
  format?: (value: string) => string;
}

/**
 * "Na planilha: 1020 · 1021 · 1035" — valores reais da coluna escolhida, logo
 * abaixo do seletor. É assim que a pessoa confere se escolheu a coluna certa
 * sem abrir o Excel ao lado (dificuldade relatada em 25/11/2026).
 */
export function ColumnSample({ rows, choice, format }: Props) {
  if (!choice || choice.kind !== "column") return null;
  const values = sampleValues(rows, choice);
  return (
    <Title variant="caption" color="muted">
      {values.length > 0
        ? `Na planilha: ${values.map((v) => (format ? format(v) : v)).join(" · ")}`
        : "Esta coluna está vazia na planilha."}
    </Title>
  );
}
