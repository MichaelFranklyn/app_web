"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useAsyncSelectOptions } from "@/hooks/useAsyncSelectOptions";
import { useMutation } from "@apollo/client/react";
import { Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  ADD_COMPONENT_TO_PRODUCT_MUTATION,
  COMPONENT_PRODUCTS_OPTIONS_QUERY,
} from "../gql";
import {
  AddComponentResponse,
  ComponentProductNode,
  ComponentProductsOptionsData,
} from "../interface";
import { extractSelectValue } from "@/utils/form";

const PRODUCT_ORDER = { by: "name", dir: "asc" } as const;

// Referências estáveis: o hook de busca as usa em dependências de memo.
const getProductsConnection = (d: ComponentProductsOptionsData) => d.products;
const toProductOption = (n: ComponentProductNode) => ({
  value: n.id,
  label: `${n.sku} — ${n.name}`,
});

interface Props {
  kitProductId: string;
  companyFactoryId: string;
  /** Produtos que já compõem o kit — escondidos do seletor. */
  usedProductIds: string[];
  onAdded: () => void;
}

export function AddComponentModal({
  kitProductId,
  companyFactoryId,
  usedProductIds,
  onAdded,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);

  // Catálogo de fábrica passa de 600 produtos: uma página fixa deixaria de fora
  // tudo o que não coubesse nela. A busca vai ao servidor, por nome ou código.
  const productScope = useMemo(
    () => [
      { field: "company_factory_id", operator: "eq", value: companyFactoryId },
    ],
    [companyFactoryId]
  );

  const {
    options: fetchedOptions,
    loading: loadingProducts,
    onSearch: onProductSearch,
  } = useAsyncSelectOptions<ComponentProductsOptionsData, ComponentProductNode>(
    {
      query: COMPONENT_PRODUCTS_OPTIONS_QUERY,
      getConnection: getProductsConnection,
      toOption: toProductOption,
      searchField: "name,sku",
      baseFilters: productScope,
      // Alfabética e larga o bastante para uma busca por código caber inteira
      // na primeira página (o código "150" casa com 27 produtos).
      order: PRODUCT_ORDER,
      first: 50,
      skip: !open,
    }
  );

  const [addComponent] = useMutation<AddComponentResponse>(
    ADD_COMPONENT_TO_PRODUCT_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const productOptions = useMemo(() => {
    const hidden = new Set([kitProductId, ...usedProductIds]);
    return fetchedOptions.filter((option) => !hidden.has(option.value));
  }, [fetchedOptions, kitProductId, usedProductIds]);

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "component",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "componentProductId",
                type: "select-single",
                label: "Produto componente",
                required: true,
                // Com a busca no servidor, lista vazia quer dizer "nada casa com
                // o que você digitou" — não "a fábrica não tem catálogo".
                placeholder: "Busque pelo nome ou código",
                options: productOptions,
                onSearch: onProductSearch,
                loading: loadingProducts,
              },
              {
                name: "quantity",
                type: "text",
                label: "Quantidade no kit",
                required: true,
                placeholder: "Ex: 2",
                hint: "Quantas unidades deste produto entram em 1 kit.",
              },
            ],
          },
        ],
      },
    ],
    [productOptions, onProductSearch, loadingProducts]
  );

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) formRef.current?.resetForm();
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    const componentProductId = extractSelectValue(data.componentProductId);
    const quantity = Number(String(data.quantity ?? "").replace(",", "."));

    await execute(
      async () => {
        if (!Number.isFinite(quantity) || quantity <= 0) {
          throw new Error("Informe uma quantidade maior que zero.");
        }
        const res = await addComponent({
          variables: { input: { kitProductId, componentProductId, quantity } },
        });
        if (!res.data?.addComponentToProduct?.status) {
          throw new Error(
            res.data?.addComponentToProduct?.message ??
              "Erro ao adicionar componente"
          );
        }
        return res.data.addComponentToProduct;
      },
      {
        successMessage: "Componente adicionado ao kit",
        onSuccess: async () => {
          handleClose(false);
          onAdded();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="sm">
          <Button.Icon icon={Plus} />
          <Button.Title>Adicionar componente</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="sm">
        <Modal.Header
          title="Adicionar componente"
          description="Escolha um produto do catálogo desta fábrica e a quantidade que entra no kit."
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
            <Button.Title>Adicionar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
