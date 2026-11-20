"use client";

import { HelpTooltip } from "@/components/HelpTooltip";
import { ToggleGroup } from "@/components/ToggleGroup";

import { RegionGroup } from "../../interface";
import { ALL_CITIES } from "../../utils";
import { Title } from "@/components/Title";

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
      // No celular o nome pode truncar; o completo fica no toque longo e no
      // leitor de tela.
      ariaLabel: `${g.label} (${g.clients.length})`,
    })),
  ];

  return (
    <div className="flex items-start gap-6">
      {/* No celular, duas cidades por linha na largura toda: soltas, cada uma
          no seu tamanho, viravam uma escada difícil de tocar. A que sobra
          sozinha na última linha ocupa as duas colunas. */}
      <ToggleGroup
        aria-label="Cidade"
        className="max-desktop:grid max-desktop:grid-cols-2 max-desktop:[&>:last-child:nth-child(odd)]:col-span-2 desktop:flex-none min-w-0 flex-1"
        options={options}
        value={city}
        onChange={onCityChange}
      />
      <HelpTooltip
        label="O que o filtro de cidade faz?"
        content={
          <Title variant="body-sm" color="inherit">
            Mostra só os clientes daquela cidade. Quem você já escolheu em
            outras cidades continua no painel Sua semana e entra na semana do
            mesmo jeito.
          </Title>
        }
      />
    </div>
  );
}
