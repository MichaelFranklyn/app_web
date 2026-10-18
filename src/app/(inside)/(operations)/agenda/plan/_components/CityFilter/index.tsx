"use client";

import { HelpTooltip } from "@/components/HelpTooltip";
import { ToggleGroup } from "@/components/ToggleGroup";

import { RegionGroup } from "../../interface";
import { ALL_CITIES } from "../../utils";

interface Props {
  /** Todas as cidades da lista, antes do filtro. */
  groups: RegionGroup[];
  city: string;
  onCityChange: (city: string) => void;
}

/**
 * Ir direto a uma cidade, sem rolar as outras. Substitui o abrir e fechar de
 * cada cidade: a lista fica toda aberta e quem quer só Camaçari toca nela.
 */
export function CityFilter({ groups, city, onCityChange }: Props) {
  // Com uma cidade só, filtrar não muda nada.
  if (groups.length < 2) return null;

  const total = groups.reduce((sum, g) => sum + g.clients.length, 0);
  const options = [
    { value: ALL_CITIES, label: `Todas (${total})` },
    ...groups.map((g) => ({
      value: g.key,
      label: `${g.label} (${g.clients.length})`,
    })),
  ];

  return (
    <div className="flex items-start gap-6">
      <ToggleGroup
        aria-label="Cidade"
        options={options}
        value={city}
        onChange={onCityChange}
      />
      <HelpTooltip
        label="O que o filtro de cidade faz?"
        content={
          <p>
            Mostra só os clientes daquela cidade. Quem você já escolheu em
            outras cidades continua no painel Sua semana e entra na semana do
            mesmo jeito.
          </p>
        }
      />
    </div>
  );
}
