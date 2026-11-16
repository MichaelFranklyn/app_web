"use client";

import { Title } from "@/components/Title";
import { ToggleGroup, ToggleOption } from "@/components/ToggleGroup";

interface StockFactoryPickerProps {
  factories: string[];
  value: string;
  onChange: (factory: string) => void;
}

/**
 * De qual fábrica é a lista do estoque — uma por vez, como no "Fazer pedido".
 * Botões sempre à vista: são poucas fábricas, e um toque troca.
 *
 * Diferente do "Fazer pedido", a troca não muda o endereço: é só um recorte da
 * mesma lista, e o que o cliente digitou nas outras fábricas segue no
 * formulário.
 */
export function StockFactoryPicker({
  factories,
  value,
  onChange,
}: StockFactoryPickerProps) {
  const options: ToggleOption<string>[] = factories.map((factory) => ({
    value: factory,
    label: factory,
  }));

  return (
    <div className="flex flex-wrap items-center gap-8">
      <Title variant="caption" color="muted">
        Fábrica
      </Title>
      <ToggleGroup
        aria-label="Fábrica do estoque"
        options={options}
        value={value}
        onChange={onChange}
        fullWidthBelowDesktop
      />
    </div>
  );
}
