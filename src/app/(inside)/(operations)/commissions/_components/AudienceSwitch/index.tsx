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
    <div className="flex items-center gap-4">
      <Title variant="caption" color="muted">
        Valores de
      </Title>
      <ToggleGroup options={OPTIONS} value={value} onChange={onChange} />
      <HelpTooltip
        label="De quem são os valores da tela"
        content={AUDIENCE_HELP}
      />
    </div>
  );
}
