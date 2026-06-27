import { FormStepSchema } from "@/components/FormBuilder";
import { labelWithHelp } from "@/components/HelpTooltip";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { extractSelectValue } from "@/utils/form";
import { useMutation } from "@apollo/client/react";
import { useMemo } from "react";

import { getProductErrorMessage } from "../errors";
import { FactoryProduct, UPDATE_PRODUCT_MUTATION } from "../gql";
import { PRODUCT_FIELD_HELP } from "../productFieldHelp";
import { useProductCatalogOptions } from "../useProductCatalogOptions";

interface UpdateProductResponse {
  updateProduct: {
    __typename?: "ProductTypeDataResponse";
    status: boolean;
    message: string;
    data: FactoryProduct | null;
  };
}

export interface EditProductModalProps {
  product: FactoryProduct;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onChanged: () => void;
  onUpdateOptimistic: (id: string, updates: Partial<FactoryProduct>) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function useEditProduct({
  product,
  open,
  onOpenChange,
  onChanged,
  onUpdateOptimistic,
  onCommit,
  onRollback,
}: EditProductModalProps) {
  const {
    categoriesData,
    unitsData,
    labelsData,
    categoryOptions,
    unitOptions,
    labelOptions,
    handleCreateUnit,
    handleCreateLabel,
  } = useProductCatalogOptions(open);

  const [updateProduct] = useMutation<UpdateProductResponse>(
    UPDATE_PRODUCT_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  // Motivos da tag "Precisa de atenção" (vindos da importação). Usados para
  // sinalizar o campo problemático no formulário e avisar no topo do modal.
  const attentionReasons = useMemo(
    () =>
      (product.attentionReason ?? "")
        .split(";")
        .map((r) => r.trim())
        .filter(Boolean),
    [product.attentionReason]
  );
  const packNeedsReview = useMemo(
    () => attentionReasons.some((r) => /m[uú]ltiplo|embalagem/i.test(r)),
    [attentionReasons]
  );

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "product",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "sku",
                type: "text",
                label: labelWithHelp("SKU", PRODUCT_FIELD_HELP.sku),
                labelText: "SKU",
                required: true,
                placeholder: "Ex: ABC-123",
                minLength: 2,
                maxLength: 100,
              },
              {
                name: "name",
                type: "text",
                label: labelWithHelp(
                  "Nome do produto",
                  PRODUCT_FIELD_HELP.name
                ),
                labelText: "Nome do produto",
                required: true,
                placeholder: "Ex: Cimento CP-II 50kg",
                minLength: 2,
                maxLength: 255,
              },
              {
                name: "categoryId",
                type: "select-single",
                label: labelWithHelp("Categoria", PRODUCT_FIELD_HELP.category),
                labelText: "Categoria",
                required: true,
                placeholder:
                  categoryOptions.length === 0
                    ? "Cadastre uma categoria primeiro"
                    : "Selecione a categoria",
                options: categoryOptions,
              },
              {
                name: "unitId",
                type: "select-single",
                label: labelWithHelp("Unidade", PRODUCT_FIELD_HELP.unit),
                labelText: "Unidade",
                required: true,
                placeholder: "Selecione ou digite para criar",
                options: unitOptions,
                onCreateOption: handleCreateUnit,
              },
              {
                name: "unitLabelId",
                type: "select-single",
                label: labelWithHelp(
                  "Rótulo de embalagem",
                  PRODUCT_FIELD_HELP.unitLabel
                ),
                labelText: "Rótulo de embalagem",
                required: true,
                placeholder: "Selecione ou digite para criar",
                options: labelOptions,
                onCreateOption: handleCreateLabel,
              },
              {
                name: "unitPerPack",
                type: "text",
                label: labelWithHelp(
                  "Unidades por embalagem",
                  PRODUCT_FIELD_HELP.unitPerPack
                ),
                labelText: "Unidades por embalagem",
                required: true,
                placeholder: "Ex: 12",
                hint: packNeedsReview ? (
                  <span className="text-(--amber)">
                    Assumimos 1 na importação — confirme as unidades por
                    embalagem.
                  </span>
                ) : undefined,
              },
              {
                name: "ncm",
                type: "text",
                label: labelWithHelp("NCM (opcional)", PRODUCT_FIELD_HELP.ncm),
                placeholder: "Ex: 3926.90.90",
                maxLength: 20,
              },
            ],
          },
        ],
      },
    ],
    [
      categoryOptions,
      unitOptions,
      labelOptions,
      handleCreateUnit,
      handleCreateLabel,
      packNeedsReview,
    ]
  );

  const initialData = useMemo(() => {
    return {
      sku: product.sku,
      name: product.name,
      ncm: product.ncm ?? "",
      unitPerPack: product.unitPerPack
        ? String(Number(product.unitPerPack))
        : "",
      unitId: product.unit
        ? { value: product.unit.id, label: product.unit.label }
        : null,
      unitLabelId: product.unitLabel
        ? { value: product.unitLabel.id, label: product.unitLabel.label }
        : null,
      categoryId: product.category
        ? { value: product.category.id, label: product.category.name }
        : null,
    };
  }, [product]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    const categoryId = extractSelectValue(data.categoryId);
    const unitId = extractSelectValue(data.unitId);
    const unitLabelId = extractSelectValue(data.unitLabelId);
    const unitPerPack = Number(
      String(data.unitPerPack ?? "").replace(",", ".")
    );

    const input: Record<string, unknown> = {};
    const sku = String(data.sku ?? "").trim();
    if (sku && sku !== product.sku) input.sku = sku;
    const name = String(data.name ?? "").trim();
    if (name && name !== product.name) input.name = name;
    const ncm = String(data.ncm ?? "").trim();
    if (ncm !== (product.ncm ?? "")) input.ncm = ncm || null;
    if (unitId && unitId !== product.unitId) input.unitId = unitId;
    if (unitLabelId && unitLabelId !== product.unitLabelId)
      input.unitLabelId = unitLabelId;
    if (!Number.isNaN(unitPerPack) && unitPerPack !== product.unitPerPack)
      input.unitPerPack = unitPerPack;
    if (categoryId && categoryId !== product.category?.id)
      input.categoryId = categoryId;

    if (Object.keys(input).length === 0) {
      onOpenChange(false);
      return;
    }

    // Nós resolvidos para o patch otimista (a lista exibe unidade/categoria).
    const unitNode =
      unitsData?.productUnits.edges.find((e) => e.node.id === unitId)?.node ??
      product.unit;
    const labelNode =
      labelsData?.productUnitLabels.edges.find((e) => e.node.id === unitLabelId)
        ?.node ?? product.unitLabel;
    const categoryNode =
      categoriesData?.productCategories.edges.find(
        (e) => e.node.id === categoryId
      )?.node ?? product.category;

    onOpenChange(false);
    onUpdateOptimistic(product.id, {
      sku: sku || product.sku,
      name: name || product.name,
      ncm: "ncm" in input ? (input.ncm as string | null) : product.ncm,
      unitPerPack: Number.isNaN(unitPerPack)
        ? product.unitPerPack
        : unitPerPack,
      unitId,
      unitLabelId,
      unit: unitNode ?? null,
      unitLabel: labelNode ?? null,
      category: categoryNode ?? null,
    });

    await execute(
      async () => {
        let res;
        try {
          res = await updateProduct({
            variables: { id: product.id, input },
          });
        } catch (error) {
          throw new Error(
            getProductErrorMessage(error, "Erro ao atualizar produto")
          );
        }

        if (!res.data?.updateProduct?.status || !res.data.updateProduct.data) {
          throw new Error(
            getProductErrorMessage(
              res.data?.updateProduct?.message,
              "Erro ao atualizar produto"
            )
          );
        }

        return res.data.updateProduct.data;
      },
      {
        successMessage: "Produto atualizado com sucesso",
        onSuccess: () => {
          onCommit();
          onChanged();
        },
        onError: () => {
          onRollback();
        },
      }
    );
  };

  return { steps, initialData, handleSubmit, isLoading, attentionReasons };
}
