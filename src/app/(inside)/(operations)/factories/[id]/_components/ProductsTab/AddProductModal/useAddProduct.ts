import { FormBuilderRef, FormStepSchema } from "@/components/FormBuilder";
import { labelWithHelp } from "@/components/HelpTooltip";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { extractSelectValue } from "@/utils/form";
import { useMutation } from "@apollo/client/react";
import { useMemo, useRef, useState } from "react";

import { getProductErrorMessage } from "../errors";
import { FactoryProduct } from "../gql";
import { PRODUCT_FIELD_HELP } from "../productFieldHelp";
import { useProductCatalogOptions } from "../useProductCatalogOptions";
import { CREATE_PRODUCT_MUTATION } from "./gql";
import { CreateProductResponse } from "./interface";

export interface AddProductModalProps {
  companyFactoryId: string;
  onChanged: () => void;
  onAddOptimistic: (product: FactoryProduct) => void;
}

export function useAddProduct({
  companyFactoryId,
  onChanged,
  onAddOptimistic,
}: AddProductModalProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);

  const {
    categoryOptions,
    unitOptions,
    labelOptions,
    handleCreateUnit,
    handleCreateLabel,
  } = useProductCatalogOptions(open);

  const [createProduct] = useMutation<CreateProductResponse>(
    CREATE_PRODUCT_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

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
              },
              {
                name: "ncm",
                type: "text",
                label: labelWithHelp("NCM (opcional)", PRODUCT_FIELD_HELP.ncm),
                placeholder: "Ex: 3926.90.90",
                maxLength: 20,
              },
              {
                name: "saleMultiple",
                type: "text",
                label: labelWithHelp(
                  "Múltiplo de venda (opcional)",
                  PRODUCT_FIELD_HELP.saleMultiple
                ),
                placeholder: "Ex: 12",
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
    ]
  );

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) formRef.current?.resetForm();
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    const categoryId = extractSelectValue(data.categoryId);
    const unitId = extractSelectValue(data.unitId);
    const unitLabelId = extractSelectValue(data.unitLabelId);
    const unitPerPack = Number(
      String(data.unitPerPack ?? "").replace(",", ".")
    );
    const saleMultiple = Number(
      String(data.saleMultiple ?? "").replace(",", ".")
    );
    const sku = String(data.sku ?? "").trim();
    const name = String(data.name ?? "").trim();
    const ncm = String(data.ncm ?? "").trim();

    await execute(
      async () => {
        let res;
        try {
          res = await createProduct({
            variables: {
              input: {
                companyFactoryId,
                categoryId,
                unitId,
                unitLabelId,
                sku,
                name,
                ncm: ncm || null,
                unitPerPack,
                saleMultiple: saleMultiple > 0 ? saleMultiple : null,
              },
            },
          });
        } catch (error) {
          throw new Error(
            getProductErrorMessage(error, "Erro ao cadastrar produto")
          );
        }

        if (!res.data?.createProduct?.status || !res.data.createProduct.data) {
          throw new Error(
            getProductErrorMessage(
              res.data?.createProduct?.message,
              "Erro ao cadastrar produto"
            )
          );
        }

        return res.data.createProduct.data;
      },
      {
        successMessage: "Produto cadastrado com sucesso",
        onSuccess: (created) => {
          handleClose(false);
          onAddOptimistic(created as FactoryProduct);
          onChanged();
        },
      }
    );
  };

  return { open, handleClose, formRef, steps, handleSubmit, isLoading };
}
