import { ChoiceCardGroup, ChoiceCardOption } from "@/components/ChoiceCard";
import { Title } from "@/components/Title";

import { ImportMode } from "./interface";

const OPTIONS: ChoiceCardOption<ImportMode>[] = [
  {
    value: "replace",
    label: "Uma tabela nova da fábrica",
    hint: "Reajuste ou lista nova: substitui a tabela que está valendo.",
  },
  {
    value: "group",
    label: "Preços de outro grupo de clientes",
    hint: "Ex.: a fábrica tem um preço para a capital e outro para o interior. Os preços entram na tabela que já vale, como mais um nível.",
  },
];

interface Props {
  mode: ImportMode;
  onChange: (mode: ImportMode) => void;
  disabled: boolean;
}

/**
 * A pergunta que separa os dois casos de "importar tabela": a fábrica mandou
 * a lista nova (substitui) ou a lista de outro grupo de clientes (soma). Sem
 * ela, a segunda planilha desativava a primeira e o escritório perdia os
 * preços do outro grupo (caso real: capital × interior, 24/11/2026).
 */
export function ImportModeChoice({ mode, onChange, disabled }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <Title variant="body-sm" weight="medium">
        O que é esta planilha?
      </Title>
      <ChoiceCardGroup
        aria-label="O que é esta planilha?"
        options={OPTIONS}
        value={mode}
        onChange={(value) => !disabled && onChange(value)}
      />
    </div>
  );
}
