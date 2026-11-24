"use client";

import { ToggleGroup, ToggleOption } from "@/components/ToggleGroup";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Title } from "@/components/Title";
import { Building2, UserRound } from "lucide-react";

import { AUDIENCE_HELP } from "../../help";
import type { CommissionAudience } from "../../utils";

interface Props {
  value: CommissionAudience;
  onChange: (audience: CommissionAudience) => void;
}

// O nome completo ("Valores de Escritório") vai no `ariaLabel`: sozinho,
// "Vendedor" repete o nome da coluna da tabela e da opção do painel de filtros,
// e nem o leitor de tela nem um teste sabem qual dos três é.
const OPTIONS: ToggleOption<CommissionAudience>[] = [
  {
    value: "office",
    label: "Escritório",
    icon: Building2,
    ariaLabel: "Valores de Escritório",
  },
  {
    value: "seller",
    label: "Vendedor",
    icon: UserRound,
    ariaLabel: "Valores de Vendedor",
  },
];

/**
 * De quem é o dinheiro que a tela inteira mostra.
 *
 * A mesma parcela carrega duas comissões — o que a fábrica paga ao escritório e
 * a fatia que o escritório repassa ao vendedor —, e elas não coincidem nem no
 * valor nem no mês. A tela mostrava só a primeira, com rótulos que não diziam
 * isso ("A receber em setembro"), enquanto o extrato em PDF trazia a segunda:
 * dois números com o mesmo nome, e a conclusão de quem lia era que um dos dois
 * estava errado.
 *
 * Fica ao lado do seletor de vendedor porque as duas perguntas andam juntas —
 * *de quem* e *qual nível* — e porque o efeito é o mesmo: trocar aqui refaz os
 * números da tela toda, não de um cartão.
 */
export function AudienceSwitch({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
      {/* Abaixo do desktop: "Valores de" e o "?" numa linha e o grupo na de
          baixo, com a linha inteira. Os três lado a lado em 360px truncavam
          as opções ("Escritó…", "Vende…"); deixando quebrar à toa, o "?"
          caía sozinho. No desktop, os três numa linha e o grupo com a
          largura natural — esticado, truncava em "Escritór…" (crítica de
          /commissions, 23/11/2026). */}
      <Title
        variant="caption"
        color="muted"
        className="shrink-0 whitespace-nowrap"
      >
        Valores de
      </Title>
      <ToggleGroup
        options={OPTIONS}
        value={value}
        onChange={onChange}
        fullWidthBelowDesktop
        className="max-desktop:order-last max-desktop:basis-full flex-nowrap"
      />
      <HelpTooltip
        label="De quem são os valores da tela"
        content={AUDIENCE_HELP}
      />
    </div>
  );
}
