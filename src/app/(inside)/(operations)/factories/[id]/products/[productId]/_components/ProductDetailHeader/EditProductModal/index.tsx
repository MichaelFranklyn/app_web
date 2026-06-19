"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation, useQuery } from "@apollo/client/react";
import { Pencil } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  PRODUCT_CATEGORIES_OPTIONS_QUERY,
  PRODUCT_UNIT_LABELS_OPTIONS_QUERY,
  PRODUCT_UNITS_OPTIONS_QUERY,
  UPDATE_PRODUCT_MUTATION,
} from "./gql";
import {
  EditProductModalProps,
  ProductCategoriesOptionsData,
  ProductUnitLabelsOptionsData,
  ProductUnitsOptionsData,
  UpdateProductResponse,
} from "./interface";

const ACTIVE_OPTIONS = [
  { value: "true", label: "Ativo" },
  { value: "false", label: "Inativo" },
];

const extractValue = (raw: unknown): string =>
  raw && typeof raw === "object" && "value" in raw
    ? String((raw as { value: string }).value)
    : String(raw ?? "");

export function EditProductModal({
  product,
  onSuccess,
}: EditProductModalProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);

  const companyCatalogInput = { first: 200 };

  const { data: categoriesData } = useQuery<ProductCategoriesOptionsData>(
    PRODUCT_CATEGORIES_OPTIONS_QUERY,
    { variables: { input: companyCatalogInput }, skip: !open }
  );

  const { data: unitsData } = useQuery<ProductUnitsOptionsData>(
    PRODUCT_UNITS_OPTIONS_QUERY,
    { variables: { input: companyCatalogInput }, skip: !open }
  );

  const { data: labelsData } = useQuery<ProductUnitLabelsOptionsData>(
    PRODUCT_UNIT_LABELS_OPTIONS_QUERY,
    { variables: { input: companyCatalogInput }, skip: !open }
  );

  const categoryOptions = useMemo(
    () =>
      categoriesData?.product_categories_options?.edges?.map(({ node }) => ({
        label: `${node.name} · ${node.segment}`,
        value: node.id,
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

  const labelOptions = useMemo(
    () =>
      labelsData?.productUnitLabels.edges.map((e) => ({
        value: e.node.id,
        label: e.node.label,
      })) ?? [],
    [labelsData]
  );

  const formSteps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "product",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "name",
                type: "text",
                label: "Nome",
                required: true,
                placeholder: "Ex: Cimento CP-II 50kg",
              },
              {
                name: "sku",
                type: "text",
                label: "SKU",
                required: true,
                placeholder: "Ex: ABC-123",
              },
              {
                name: "categoryId",
                type: "select-single",
                label: "Categoria",
                required: true,
                options: categoryOptions,
              },
              {
                name: "unitId",
                type: "select-single",
                label: "Unidade",
                required: true,
                options: unitOptions,
              },
              {
                name: "unitLabelId",
                type: "select-single",
                label: "Rótulo de embalagem",
                required: true,
                options: labelOptions,
              },
              {
                name: "unitPerPack",
                type: "text",
                label: "Unidades por embalagem",
                required: true,
                placeholder: "Ex: 12",
              },
              {
                name: "ncm",
                type: "text",
                label: "NCM (opcional)",
                placeholder: "Ex: 3926.90.90",
                hint: "Classificação fiscal do produto — define IPI/ST e sai no pedido.",
              },
              {
                name: "saleMultiple",
                type: "text",
                label: "Múltiplo de venda (opcional)",
                placeholder: "Ex: 12",
                hint: "Pedidos só aceitam quantidades múltiplas deste valor, em embalagens. Vazio = venda livre.",
              },
              {
                name: "isActive",
                type: "select-single",
                label: "Status",
                required: true,
                options: ACTIVE_OPTIONS,
              },
            ],
          },
        ],
      },
    ],
    [categoryOptions, unitOptions, labelOptions]
  );

  const initialData = useMemo(
    () => ({
      name: product.name,
      sku: product.sku,
      ncm: product.ncm ?? "",
      unitPerPack: product.unitPerPack ? String(Number(product.unitPerPack)) : "",
      saleMultiple: product.saleMultiple
        ? String(Number(product.saleMultiple))
        : "",
      categoryId: product.category
        ? {
            label: `${product.category.name} · ${product.category.segment}`,
            value: product.category.id,
          }
        : null,
      unitId: product.unit
        ? { value: product.unit.id, label: product.unit.label }
        : null,
      unitLabelId: product.unitLabel
        ? { value: product.unitLabel.id, label: product.unitLabel.label }
        : null,
      isActive:
        ACTIVE_OPTIONS.find(
          (o) => o.value === (product.isActive ? "true" : "false")
        ) ?? null,
    }),
    [product]
  );

  const [updateProduct] = useMutation<UpdateProductResponse>(
    UPDATE_PRODUCT_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const input: Record<string, unknown> = {};
    const name = String(data.name ?? "").trim();
    if (name && name !== product.name) input.name = name;
    const sku = String(data.sku ?? "").trim();
    if (sku && sku !== product.sku) input.sku = sku;
    const ncm = String(data.ncm ?? "").trim();
    if (ncm !== (product.ncm ?? "")) input.ncm = ncm || null;
    const categoryId = extractValue(data.categoryId);
    if (categoryId && categoryId !== product.category?.id)
      input.categoryId = categoryId;
    const unitId = extractValue(data.unitId);
    if (unitId && unitId !== product.unitId) input.unitId = unitId;
    const unitLabelId = extractValue(data.unitLabelId);
    if (unitLabelId && unitLabelId !== product.unitLabelId)
      input.unitLabelId = unitLabelId;
    const unitPerPack = Number(
      String(data.unitPerPack ?? "").replace(",", ".")
    );
    if (
      !Number.isNaN(unitPerPack) &&
      String(unitPerPack) !== product.unitPerPack
    )
      input.unitPerPack = unitPerPack;
    const saleMultiple = Number(
      String(data.saleMultiple ?? "").replace(",", ".")
    );
    const currentMultiple = product.saleMultiple
      ? Number(product.saleMultiple)
      : 0;
    if (saleMultiple > 0 && saleMultiple !== currentMultiple)
      input.saleMultiple = saleMultiple;
    const isActive = extractValue(data.isActive);
    if (isActive && isActive !== (product.isActive ? "true" : "false"))
      input.isActive = isActive === "true";

    if (Object.keys(input).length === 0) {
      setOpen(false);
      return;
    }

    await execute(
      async () => {
        const res = await updateProduct({
          variables: { id: product.id, input },
        });

        if (!res.data?.updateProduct?.status || !res.data.updateProduct.data) {
          throw new Error(
            res.data?.updateProduct?.message ?? "Erro ao atualizar produto"
          );
        }

        return res.data.updateProduct.data;
      },
      {
        successMessage: "Produto atualizado com sucesso",
        onSuccess: () => {
          setOpen(false);
          formRef.current?.resetForm();
          onSuccess();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="outline" color="neutral" size="sm">
          <Button.Icon icon={Pencil} />
          <Button.Title>Editar produto</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Editar produto"
          description="Atualize os dados base do produto."
        />

        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={formSteps}
            onSubmit={handleSubmit}
            loading={isLoading}
            initialData={initialData}
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
            <Button.Title>Salvar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
