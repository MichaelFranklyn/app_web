"use client";

import { HelpTooltip } from "@/components/HelpTooltip";
import { Input, InputSearch, SelectOption } from "@/components/Input";
import { ToggleGroup } from "@/components/ToggleGroup";

import { RoutineSellerOption } from "../../../interface";
import { PriorityScope } from "../../interface";

const SCOPE_OPTIONS: { value: PriorityScope; label: string }[] = [
  { value: "priority", label: "Prioritários" },
  { value: "all", label: "Toda a carteira" },
];

interface Props {
  scope: PriorityScope;
  onScopeChange: (scope: PriorityScope) => void;
  search: string;
  onSearchChange: (text: string) => void;
  /** Só para quem escolhe de quem é a agenda (gestor). */
  sellers?: RoutineSellerOption[];
  sellerId: string | null;
  onSelectSeller: (id: string) => void;
}

/**
 * De quem e o que a lista mostra, numa linha só. A busca procura na carteira
 * inteira, com qualquer filtro.
 */
export function PriorityToolbar({
  scope,
  onScopeChange,
  search,
  onSearchChange,
  sellers,
  sellerId,
  onSelectSeller,
}: Props) {
  const sellerOptions: SelectOption[] = (sellers ?? []).map((s) => ({
    value: s.id,
    label: s.name,
  }));

  return (
    <div className="flex flex-wrap items-center gap-12">
      {sellers && (
        <div className="desktop:w-[220px] w-full">
          <Input.Select
            size="sm"
            options={sellerOptions}
            value={sellerOptions.find((o) => o.value === sellerId) ?? null}
            variant="single"
            disabledClear
            placeholder="Escolha o vendedor"
            onChange={(val: SelectOption | SelectOption[] | null) => {
              const opt = Array.isArray(val) ? val[0] : val;
              if (opt) onSelectSeller(opt.value);
            }}
          />
        </div>
      )}
      <div className="desktop:w-[280px] w-full">
        <InputSearch
          size="sm"
          placeholder="Ex: nome do cliente, bairro ou cidade"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label="Buscar cliente"
        />
      </div>
      <div className="flex items-center gap-6">
        <ToggleGroup
          aria-label="Quais clientes mostrar"
          options={SCOPE_OPTIONS}
          value={scope}
          onChange={onScopeChange}
        />
        <HelpTooltip
          label="O que entra em Prioritários?"
          content={
            <p>
              Prioritários são a metade de cima da sua lista — quem mais precisa
              de você agora — e quem pediu visita. Em Toda a carteira aparecem
              também os que podem esperar. Quem já está escolhido nunca some da
              tela.
            </p>
          }
        />
      </div>
    </div>
  );
}
