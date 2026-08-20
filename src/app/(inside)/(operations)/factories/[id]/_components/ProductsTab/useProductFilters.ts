"use client";

import { FilterField } from "@/components/Filters";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { useMemo } from "react";

import { PRODUCT_CATEGORIES_QUERY, PRODUCT_UNITS_QUERY } from "./gql";
import { ProductCategoriesData, ProductUnitsData } from "./interface";

// Categorias e unidades são catálogo da EMPRESA (escopo no back), não da
// fábrica: a mesma lista alimenta o formulário de produto. Sem `first` fixo — o
// `useCompleteList` traz o total quando a primeira página não dá conta.
const COMPANY_CATALOG_INPUT = {};
const getCategories = (d: ProductCategoriesData) => d.productCategories;
const getUnits = (d: ProductUnitsData) => d.productUnits;

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
    useCompleteList<ProductCategoriesData>(
      PRODUCT_CATEGORIES_QUERY,
      COMPANY_CATALOG_INPUT,
      getCategories,
      { fetchPolicy: "cache-and-network" }
    );

  const { data: unitsData, error: unitsError } =
    useCompleteList<ProductUnitsData>(
      PRODUCT_UNITS_QUERY,
      COMPANY_CATALOG_INPUT,
      getUnits,
      { fetchPolicy: "cache-and-network" }
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
