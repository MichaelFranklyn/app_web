import { FormBuilderRef } from "@/components/FormBuilder";
import { useToast } from "@/components/Toast";
import { useLogoUpload } from "@/components/LogoUpload";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { extractSelectValue } from "@/utils/form";
import { useMutation } from "@apollo/client/react";
import { useCallback, useMemo, useRef, useState } from "react";

import { getProductErrorMessage } from "../errors";
import { FactoryProduct } from "../gql";
import { useProductCatalogOptions } from "../useProductCatalogOptions";
import { createProductExtras } from "./createProductExtras";
import {
  ADD_TAX_TO_PRODUCT_MUTATION,
  CREATE_PRICE_LIST_ITEM_MUTATION,
  CREATE_PRODUCT_MUTATION,
} from "./gql";
import {
  AddProductTaxResponse,
  CreatePriceListItemResponse,
  CreateProductResponse,
} from "./interface";
import { buildAddProductSteps } from "./steps";
import { useProductExtrasOptions } from "./useProductExtrasOptions";
import {
  buildExtrasSummary,
  findIncompleteStep,
  parsePriceRows,
  parseTaxRows,
  toNumber,
} from "./utils";

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
  const [step, setStep] = useState(0);
  const formRef = useRef<FormBuilderRef>(null);
  const { toast } = useToast();

  const {
    categoryOptions,
    unitOptions,
    labelOptions,
    handleCreateUnit,
    handleCreateLabel,
  } = useProductCatalogOptions(open);

  const { taxRuleOptions, priceListOptions, tierOptions, handleCreateTaxRule } =
    useProductExtrasOptions(open, companyFactoryId);

  const [createProduct] = useMutation<CreateProductResponse>(
    CREATE_PRODUCT_MUTATION
  );
  const [addTaxToProduct] = useMutation<AddProductTaxResponse>(
    ADD_TAX_TO_PRODUCT_MUTATION
  );
  const [createPriceListItem] = useMutation<CreatePriceListItemResponse>(
    CREATE_PRICE_LIST_ITEM_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();
  const photo = useLogoUpload("image");

  const steps = useMemo(
    () =>
      buildAddProductSteps({
        categoryOptions,
        unitOptions,
        labelOptions,
        taxRuleOptions,
        priceListOptions,
        tierOptions,
        onCreateUnit: handleCreateUnit,
        onCreateLabel: handleCreateLabel,
        onCreateTaxRule: handleCreateTaxRule,
      }),
    [
      categoryOptions,
      unitOptions,
      labelOptions,
      taxRuleOptions,
      priceListOptions,
      tierOptions,
      handleCreateUnit,
      handleCreateLabel,
      handleCreateTaxRule,
    ]
  );

  const isLastStep = step === steps.length - 1;

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) {
      formRef.current?.resetForm();
      setStep(0);
      photo.reset();
    }
  };

  // `nextStep` valida o passo corrente e só então avança; espelhamos o índice
  // aqui porque o rodapé fica fora do FormBuilder.
  const goNext = useCallback(async () => {
    const moved = await formRef.current?.nextStep();
    if (moved) setStep((prev) => prev + 1);
  }, []);

  const goPrev = useCallback(() => {
    formRef.current?.prevStep();
    setStep((prev) => Math.max(0, prev - 1));
  }, []);

  const sendTax = useCallback(
    async (productId: string, taxRuleId: string, rate: number) => {
      const res = await addTaxToProduct({
        // Alíquota vai como texto: o scalar Decimal do back converte sem o
        // arredondamento binário que um float traria.
        variables: { input: { productId, taxRuleId, rate: String(rate) } },
      });
      if (!res.data?.addTaxToProduct?.status) {
        throw new Error(
          getProductErrorMessage(
            res.data?.addTaxToProduct?.message,
            "erro ao vincular"
          )
        );
      }
    },
    [addTaxToProduct]
  );

  const sendPrice = useCallback(
    async (
      productId: string,
      priceListId: string,
      tierId: string,
      unitPrice: number
    ) => {
      const res = await createPriceListItem({
        variables: { input: { productId, priceListId, tierId, unitPrice } },
      });
      if (!res.data?.createPriceListItem?.status) {
        throw new Error(
          getProductErrorMessage(
            res.data?.createPriceListItem?.message,
            "erro ao cadastrar"
          )
        );
      }
    },
    [createPriceListItem]
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const categoryId = extractSelectValue(data.categoryId);
    const unitId = extractSelectValue(data.unitId);
    const unitLabelId = extractSelectValue(data.unitLabelId);
    const unitPerPack = toNumber(data.unitPerPack);
    const saleMultiple = toNumber(data.saleMultiple);
    const sku = String(data.sku ?? "").trim();
    const name = String(data.name ?? "").trim();
    const ncm = String(data.ncm ?? "").trim();

    const incomplete = findIncompleteStep(data.taxes, data.prices);
    if (incomplete) {
      toast({
        variant: "error",
        title: "Revise os dados",
        description: incomplete,
      });
      return;
    }

    const taxRows = parseTaxRows(data.taxes);
    const priceRows = parsePriceRows(data.prices);
    // A foto fica fora do FormBuilder (não há tipo de campo de imagem).
    const photoInput = await photo.toLogoInput();

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
                ...photoInput,
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

        const product = res.data.createProduct.data;
        // Impostos e preços exigem o produto já criado: são gravados aqui, um a
        // um, para o usuário não precisar abrir o detalhe só para completá-los.
        const extras = await createProductExtras(
          taxRows,
          priceRows,
          (row) => sendTax(product.id, row.taxRuleId, row.rate),
          (row) =>
            sendPrice(product.id, row.priceListId, row.tierId, row.unitPrice)
        );

        return { product, extras };
      },
      {
        successMessage: (result) =>
          buildExtrasSummary(result.extras.taxes, result.extras.prices),
        onSuccess: ({ product, extras }) => {
          handleClose(false);
          onAddOptimistic(product);
          onChanged();

          if (extras.failures.length > 0) {
            toast({
              variant: "warning",
              title: "Produto criado com pendências",
              description: `${extras.failures.join(" · ")}. Você pode completar no detalhe do produto.`,
            });
          }
        },
      }
    );
  };

  return {
    open,
    handleClose,
    formRef,
    photo,
    steps,
    step,
    isLastStep,
    goNext,
    goPrev,
    handleSubmit,
    isLoading,
  };
}
