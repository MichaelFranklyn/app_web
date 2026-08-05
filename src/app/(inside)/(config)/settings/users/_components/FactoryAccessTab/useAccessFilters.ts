"use client";

import { FilterField } from "@/components/Filters";
import { SelectOption } from "@/components/Input";
import { FieldConfig } from "@/hooks/useTableFilters";
import { factoryName } from "@/utils/company";
import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";
import {
  COMPANY_FACTORIES_OPTIONS_QUERY,
  SELLERS_OPTIONS_QUERY,
} from "./AddAccessModal/gql";
import {
  CompanyFactoriesOptionsData,
  SellersOptionsData,
} from "./AddAccessModal/interface";

// Vendedores e fábricas de uma empresa cabem numa página só (dezenas).
const OPTIONS_PAGE = 200;

/**
 * Filtros da lista de acessos, resolvidos NO BACKEND.
 *
 * Vendedor e fábrica entram pelo id (`seller_id`, `factory_id`), que são colunas
 * de verdade da tabela de acesso — ao contrário dos NOMES, que moram nas tabelas
 * vizinhas. É a razão de o filtro alcançar essas duas dimensões enquanto a
 * ordenação por elas não existe: filtrar por id o banco faz; ordenar por nome
 * exigiria o `ORDER BY` cruzar o join, o que o listador genérico não faz.
 */
export const ACCESS_TABLE_FIELDS: Record<string, FieldConfig> = {
  sellerId: { type: "select", queryField: "seller_id" },
  factoryId: { type: "select", queryField: "factory_id" },
  isActive: { type: "select", queryField: "is_active" },
};

/** Colunas de `seller_factory_access` por onde a lista pode ser ordenada. */
export const ACCESS_SORTABLE_FIELDS = ["created_at", "is_active"];

const STATUS_OPTIONS: SelectOption[] = [
  { value: "true", label: "Ativo" },
  { value: "false", label: "Inativo" },
];

export function useAccessFilters(): FilterField[] {
  const sellersQuery = useQuery<SellersOptionsData>(SELLERS_OPTIONS_QUERY, {
    variables: { input: { first: OPTIONS_PAGE } },
  });

  const factoriesQuery = useQuery<CompanyFactoriesOptionsData>(
    COMPANY_FACTORIES_OPTIONS_QUERY,
    { variables: { input: { first: OPTIONS_PAGE } } }
  );

  return useMemo<FilterField[]>(() => {
    const sellers: SelectOption[] = (
      sellersQuery.data?.sellers_options?.edges ?? []
    ).map(({ node }) => ({ value: node.id, label: node.name }));

    const factories: SelectOption[] = (
      factoriesQuery.data?.company_factories_options?.edges ?? []
    ).map(({ node }) => ({
      value: node.factoryId,
      label: factoryName(node.factory) ?? "—",
    }));

    return [
      {
        type: "select",
        key: "sellerId",
        label: "Vendedor",
        placeholder: "Todos os vendedores",
        options: sellers,
      },
      {
        type: "select",
        key: "factoryId",
        label: "Fábrica",
        placeholder: "Todas as fábricas",
        options: factories,
      },
      {
        type: "select",
        key: "isActive",
        label: "Status",
        placeholder: "Ativos e inativos",
        options: STATUS_OPTIONS,
      },
    ];
  }, [sellersQuery.data, factoriesQuery.data]);
}
