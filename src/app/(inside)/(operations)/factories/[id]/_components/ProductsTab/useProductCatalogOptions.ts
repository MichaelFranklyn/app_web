import { useToast } from "@/components/Toast";
import { useMutation, useQuery } from "@apollo/client/react";
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
const COMPANY_CATALOG_INPUT = { first: 200 };

/**
 * Catálogo compartilhado pelos formulários de produto (Add/Edit): carrega
 * categorias/unidades/rótulos e expõe a criação inline (cria no back, recarrega
 * as opções e devolve a opção já com o id real para seleção imediata).
 *
 * Devolve também os dados crus (`*Data`) para resolver os nós do patch otimista.
 */
export function useProductCatalogOptions(open: boolean) {
  const { data: categoriesData } = useQuery<ProductCategoriesData>(
    PRODUCT_CATEGORIES_QUERY,
    { variables: { input: COMPANY_CATALOG_INPUT }, skip: !open }
  );

  const { data: unitsData, refetch: refetchUnits } = useQuery<ProductUnitsData>(
    PRODUCT_UNITS_QUERY,
    { variables: { input: COMPANY_CATALOG_INPUT }, skip: !open }
  );

  const { data: labelsData, refetch: refetchLabels } =
    useQuery<ProductUnitLabelsData>(PRODUCT_UNIT_LABELS_QUERY, {
      variables: { input: COMPANY_CATALOG_INPUT },
      skip: !open,
    });

  const [createUnit] = useMutation<CreateProductUnitResponse>(
    CREATE_PRODUCT_UNIT_MUTATION
  );
  const [createUnitLabel] = useMutation<CreateProductUnitLabelResponse>(
    CREATE_PRODUCT_UNIT_LABEL_MUTATION
  );
  const { toast } = useToast();

  const handleCreateUnit = useCallback(
    async (label: string): Promise<SelectOption> => {
      try {
        const res = await createUnit({
          variables: { input: { label: label.trim() } },
        });
        const created = res.data?.createProductUnit?.data;
        if (!res.data?.createProductUnit?.status || !created) {
          throw new Error(
            getProductErrorMessage(
              res.data?.createProductUnit?.message,
              "Erro ao criar unidade"
            )
          );
        }
        await refetchUnits();
        toast({
          variant: "success",
          title: "Sucesso",
          description: "Unidade criada com sucesso",
        });
        return { value: created.id, label: created.label };
      } catch (error) {
        toast({
          variant: "error",
          title: "Erro",
          description: getProductErrorMessage(error, "Erro ao criar unidade"),
        });
        throw error;
      }
    },
    [createUnit, refetchUnits, toast]
  );

  const handleCreateLabel = useCallback(
    async (label: string): Promise<SelectOption> => {
      try {
        const res = await createUnitLabel({
          variables: { input: { label: label.trim() } },
        });
        const created = res.data?.createProductUnitLabel?.data;
        if (!res.data?.createProductUnitLabel?.status || !created) {
          throw new Error(
            getProductErrorMessage(
              res.data?.createProductUnitLabel?.message,
              "Erro ao criar rótulo de embalagem"
            )
          );
        }
        await refetchLabels();
        toast({
          variant: "success",
          title: "Sucesso",
          description: "Rótulo de embalagem criado com sucesso",
        });
        return { value: created.id, label: created.label };
      } catch (error) {
        toast({
          variant: "error",
          title: "Erro",
          description: getProductErrorMessage(
            error,
            "Erro ao criar rótulo de embalagem"
          ),
        });
        throw error;
      }
    },
    [createUnitLabel, refetchLabels, toast]
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
