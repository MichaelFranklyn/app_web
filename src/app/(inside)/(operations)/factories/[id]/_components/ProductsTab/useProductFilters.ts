"use client";

import { FilterField } from "@/components/Filters";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

import { PRODUCT_CATEGORIES_QUERY, PRODUCT_UNITS_QUERY } from "./gql";
import { ProductCategoriesData, ProductUnitsData } from "./interface";

// Categorias e unidades são catálogo da EMPRESA (escopo no back), não da
// fábrica: a mesma lista alimenta o formulário de produto.
const COMPANY_CATALOG_INPUT = { first: 200 };

/**
 * Campos do painel de filtros do catálogo de produtos.
 *
 * Filtram no BANCO (via `useTableData`), e não na página aberta: a lista é
 * paginada, então filtrar em memória esconderia produtos das páginas seguintes.
 *
 * Ficam de fora a busca por nome/código e "Precisa de atenção": os dois têm
 * controle próprio no cabeçalho, por serem os caminhos mais usados. Repeti-los
 * aqui daria dois lugares para mexer no mesmo filtro.
 */
export function useProductFilters(): FilterField[] {
  const { data: categoriesData, error: categoriesError } =
    useQuery<ProductCategoriesData>(PRODUCT_CATEGORIES_QUERY, {
      variables: { input: COMPANY_CATALOG_INPUT },
    });

  const { data: unitsData, error: unitsError } = useQuery<ProductUnitsData>(
    PRODUCT_UNITS_QUERY,
    { variables: { input: COMPANY_CATALOG_INPUT } }
  );

  useQueryErrorToast(
    categoriesError ?? unitsError,
    "Não foi possível carregar as opções de filtro. Tente novamente."
  );

  const categoryOptions = useMemo(
    () =>
      categoriesData?.productCategories.edges.map((e) => ({
        value: e.node.id,
        label: e.node.name,
      })) ?? [],
    [categoriesData]
  );

  const unitOptions = useMemo(
    () =>
      unitsData?.productUnits.edges.map((e) => ({
        value: e.node.id,
        label: e.node.label,
      })) ?? [],
    [unitsData]
  );

  return useMemo<FilterField[]>(
    () => [
      {
        type: "select",
        key: "categoryId",
        label: "Categoria",
        placeholder: "Todas as categorias",
        options: categoryOptions,
        // Empresa que ainda não separou categorias não precisa do campo.
        hidden: categoryOptions.length === 0,
      },
      {
        type: "select",
        key: "unitId",
        label: "Unidade",
        placeholder: "Todas as unidades",
        options: unitOptions,
        hidden: unitOptions.length === 0,
      },
      {
        type: "select",
        key: "status",
        label: "Situação",
        placeholder: "Ativos e inativos",
        options: [
          { value: "true", label: "Ativo" },
          { value: "false", label: "Inativo" },
        ],
      },
    ],
    [categoryOptions, unitOptions]
  );
}
