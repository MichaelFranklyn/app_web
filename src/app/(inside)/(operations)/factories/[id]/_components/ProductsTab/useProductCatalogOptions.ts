import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useMutation } from "@apollo/client/react";
import { useCallback, useMemo } from "react";

import { getProductErrorMessage } from "./errors";
import {
  CREATE_PRODUCT_UNIT_LABEL_MUTATION,
  CREATE_PRODUCT_UNIT_MUTATION,
  PRODUCT_CATEGORIES_QUERY,
  PRODUCT_UNIT_LABELS_QUERY,
  PRODUCT_UNITS_QUERY,
} from "./gql";
import {
  CreateProductUnitLabelResponse,
  CreateProductUnitResponse,
  ProductCategoriesData,
  ProductUnitLabelsData,
  ProductUnitsData,
  SelectOption,
} from "./interface";

// Categorias, unidades e rótulos são catálogo da empresa (escopo no back).
// Sem `first` fixo: o `useCompleteList` rebusca pelo total se a primeira página
// não trouxer tudo — um teto silencioso aqui esconderia opção do formulário.
const COMPANY_CATALOG_INPUT = {};
const getCategories = (d: ProductCategoriesData) => d.productCategories;
const getUnits = (d: ProductUnitsData) => d.productUnits;
const getLabels = (d: ProductUnitLabelsData) => d.productUnitLabels;

/**
 * Catálogo compartilhado pelos formulários de produto (Add/Edit): carrega
 * categorias/unidades/rótulos e expõe a criação inline (cria no back, recarrega
 * as opções e devolve a opção já com o id real para seleção imediata).
 *
 * Devolve também os dados crus (`*Data`) para resolver os nós do patch otimista.
 */
export function useProductCatalogOptions(open: boolean) {
  const { data: categoriesData, error: categoriesError } =
    useCompleteList<ProductCategoriesData>(
      PRODUCT_CATEGORIES_QUERY,
      COMPANY_CATALOG_INPUT,
      getCategories,
      { skip: !open, fetchPolicy: "cache-and-network" }
    );

  const {
    data: unitsData,
    error: unitsError,
    refetch: refetchUnits,
  } = useCompleteList<ProductUnitsData>(
    PRODUCT_UNITS_QUERY,
    COMPANY_CATALOG_INPUT,
    getUnits,
    { skip: !open, fetchPolicy: "cache-and-network" }
  );

  const {
    data: labelsData,
    error: labelsError,
    refetch: refetchLabels,
  } = useCompleteList<ProductUnitLabelsData>(
    PRODUCT_UNIT_LABELS_QUERY,
    COMPANY_CATALOG_INPUT,
    getLabels,
    { skip: !open, fetchPolicy: "cache-and-network" }
  );

  const [createUnit] = useMutation<CreateProductUnitResponse>(
    CREATE_PRODUCT_UNIT_MUTATION
  );
  const [createUnitLabel] = useMutation<CreateProductUnitLabelResponse>(
    CREATE_PRODUCT_UNIT_LABEL_MUTATION
  );
  const { execute } = useAsyncAction();

  // `execute` mostra o toast (sucesso/erro) e engole o erro devolvendo undefined.
  // Como isto alimenta o `onCreateOption` do select, RELANÇAMOS em falha: sem o
  // throw, o select criaria uma opção-fantasma com o label como id.
  const handleCreateUnit = useCallback(
    async (label: string): Promise<SelectOption> => {
      const created = await execute(
        async () => {
          const res = await createUnit({
            variables: { input: { label: label.trim() } },
          });
          const data = res.data?.createProductUnit?.data;
          if (!res.data?.createProductUnit?.status || !data) {
            throw new Error(
              getProductErrorMessage(
                res.data?.createProductUnit?.message,
                "Erro ao criar unidade"
              )
            );
          }
          await refetchUnits();
          return { value: data.id, label: data.label };
        },
        { successMessage: "Unidade criada com sucesso" }
      );
      if (!created) throw new Error("Erro ao criar unidade");
      return created;
    },
    [execute, createUnit, refetchUnits]
  );

  const handleCreateLabel = useCallback(
    async (label: string): Promise<SelectOption> => {
      const created = await execute(
        async () => {
          const res = await createUnitLabel({
            variables: { input: { label: label.trim() } },
          });
          const data = res.data?.createProductUnitLabel?.data;
          if (!res.data?.createProductUnitLabel?.status || !data) {
            throw new Error(
              getProductErrorMessage(
                res.data?.createProductUnitLabel?.message,
                "Erro ao criar rótulo de embalagem"
              )
            );
          }
          await refetchLabels();
          return { value: data.id, label: data.label };
        },
        { successMessage: "Rótulo de embalagem criado com sucesso" }
      );
      if (!created) throw new Error("Erro ao criar rótulo de embalagem");
      return created;
    },
    [execute, createUnitLabel, refetchLabels]
  );

  const categoryOptions: SelectOption[] = useMemo(
    () =>
      categoriesData?.productCategories.edges.map((e) => ({
        value: e.node.id,
        label: e.node.name,
      })) ?? [],
    [categoriesData]
  );

  const unitOptions: SelectOption[] = useMemo(
    () =>
      unitsData?.productUnits.edges.map((e) => ({
        value: e.node.id,
        label: e.node.label,
      })) ?? [],
    [unitsData]
  );

  const labelOptions: SelectOption[] = useMemo(
    () =>
      labelsData?.productUnitLabels.edges.map((e) => ({
        value: e.node.id,
        label: e.node.label,
      })) ?? [],
    [labelsData]
  );

  useQueryErrorToast(
    categoriesError ?? unitsError ?? labelsError,
    "Não foi possível carregar as opções. Tente novamente."
  );

  return {
    categoriesData,
    unitsData,
    labelsData,
    categoryOptions,
    unitOptions,
    labelOptions,
    handleCreateUnit,
    handleCreateLabel,
  };
}
