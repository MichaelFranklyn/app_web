"use client";

import { FilterField } from "@/components/Filters";
import { useMemo } from "react";
import { PLAN_OPTIONS, STATUS_OPTIONS } from "./utils";

/**
 * Filtros da lista de empresas.
 *
 * A busca fica DENTRO do painel para que "Limpar filtros" a apague junto —
 * fora dele, o texto continuaria valendo sem ninguém ver e a lista pareceria
 * quebrada. Mesma decisão da carteira de clientes.
 */
export function useTenantFilters(): FilterField[] {
  return useMemo(
    () => [
      {
        type: "text",
        key: "search",
        label: "Buscar",
        placeholder: "Razão social, nome fantasia ou CNPJ",
      },
      {
        type: "select",
        key: "plan",
        label: "Plano",
        placeholder: "Todos os planos",
        options: PLAN_OPTIONS,
      },
      {
        type: "select",
        key: "isActive",
        label: "Situação",
        placeholder: "Todas",
        options: STATUS_OPTIONS,
      },
    ],
    []
  );
}
