"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation, useQuery } from "@apollo/client/react";
import { Plus } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { getProductErrorMessage } from "../errors";
import { FactoryProduct } from "../gql";
import { labelWithHelp } from "@/components/HelpTooltip";

import { PRODUCT_FIELD_HELP } from "../productFieldHelp";
import {
  CREATE_PRODUCT_MUTATION,
  CREATE_PRODUCT_UNIT_LABEL_MUTATION,
  CREATE_PRODUCT_UNIT_MUTATION,
  PRODUCT_CATEGORIES_QUERY,
  PRODUCT_UNIT_LABELS_QUERY,
  PRODUCT_UNITS_QUERY,
} from "./gql";
import {
  CreateProductResponse,
  CreateProductUnitLabelResponse,
  CreateProductUnitResponse,
  ProductCategoriesData,
  ProductUnitLabelsData,
  ProductUnitsData,
  SelectOption,
} from "./interface";

interface Props {
  companyFactoryId: string;
  onChanged: () => void;
  onAddOptimistic: (product: FactoryProduct) => void;
}

const extractValue = (raw: unknown): string =>
  raw && typeof raw === "object" && "value" in raw
    ? String((raw as { value: string }).value)
    : String(raw ?? "");

export function AddProductModal({
  companyFactoryId,
  onChanged,
  onAddOptimistic,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);

  // Categorias, unidades e rótulos são catálogo da empresa (escopo no back)
  const companyCatalogInput = { first: 200 };

  const { data: categoriesData } = useQuery<ProductCategoriesData>(
    PRODUCT_CATEGORIES_QUERY,
    { variables: { input: companyCatalogInput }, skip: !open }
  );

  const { data: unitsData, refetch: refetchUnits } =
    useQuery<ProductUnitsData>(PRODUCT_UNITS_QUERY, {
      variables: { input: companyCatalogInput },
      skip: !open,
    });

  const { data: labelsData, refetch: refetchLabels } =
    useQuery<ProductUnitLabelsData>(PRODUCT_UNIT_LABELS_QUERY, {
      variables: { input: companyCatalogInput },
      skip: !open,
    });

  const [createProduct] = useMutation<CreateProductResponse>(
    CREATE_PRODUCT_MUTATION
  );
  const [createUnit] = useMutation<CreateProductUnitResponse>(
    CREATE_PRODUCT_UNIT_MUTATION
  );
  const [createUnitLabel] = useMutation<CreateProductUnitLabelResponse>(
    CREATE_PRODUCT_UNIT_LABEL_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();
  const { toast } = useToast();

  // Criação inline (no próprio select): cria a unidade/rótulo no back, recarrega
  // as opções e devolve a opção já com o id real para ser selecionada na hora.
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

  const categoryOptions = useMemo(
    () =>
      categoriesData?.productCategories.edges.map((e) => ({
        value: e.node.id,
        label: e.node.name,
      })) ?? [],
    [categoriesData]
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
                label: labelWithHelp("Nome do produto", PRODUCT_FIELD_HELP.name),
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
    [categoryOptions, unitOptions, labelOptions, handleCreateUnit, handleCreateLabel]
  );

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) formRef.current?.resetForm();
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    const categoryId = extractValue(data.categoryId);
    const unitId = extractValue(data.unitId);
    const unitLabelId = extractValue(data.unitLabelId);
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

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="sm">
          <Button.Icon icon={Plus} />
          <Button.Title>Novo produto</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Novo produto"
          description="Adicione um produto ao catálogo desta fábrica."
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={steps}
            onSubmit={handleSubmit}
            loading={isLoading}
            unstyled
          />
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              noUppercase
              disabled={isLoading}
            >
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={isLoading}
            onClick={() => formRef.current?.submitForm()}
          >
            <Button.Title>Cadastrar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
