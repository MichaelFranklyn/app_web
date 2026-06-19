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
import { Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  ADD_COMPONENT_TO_PRODUCT_MUTATION,
  COMPONENT_PRODUCTS_OPTIONS_QUERY,
} from "../gql";
import {
  AddComponentResponse,
  ComponentProductsOptionsData,
} from "../interface";

interface Props {
  kitProductId: string;
  companyFactoryId: string;
  /** Produtos que já compõem o kit — escondidos do seletor. */
  usedProductIds: string[];
  onAdded: () => void;
}

const extractValue = (raw: unknown): string =>
  raw && typeof raw === "object" && "value" in raw
    ? String((raw as { value: string }).value)
    : String(raw ?? "");

export function AddComponentModal({
  kitProductId,
  companyFactoryId,
  usedProductIds,
  onAdded,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);

  const { data: productsData } = useQuery<ComponentProductsOptionsData>(
    COMPONENT_PRODUCTS_OPTIONS_QUERY,
    {
      variables: {
        input: {
          first: 200,
          filters: [
            { field: "company_factory_id", operator: "eq", value: companyFactoryId },
          ],
        },
      },
      skip: !open,
    }
  );

  const [addComponent] = useMutation<AddComponentResponse>(
    ADD_COMPONENT_TO_PRODUCT_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const productOptions = useMemo(() => {
    const hidden = new Set([kitProductId, ...usedProductIds]);
    return (
      productsData?.products.edges
        .filter((e) => !hidden.has(e.node.id))
        .map((e) => ({
          value: e.node.id,
          label: `${e.node.sku} — ${e.node.name}`,
        })) ?? []
    );
  }, [productsData, kitProductId, usedProductIds]);

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
                placeholder:
                  productOptions.length === 0
                    ? "Nenhum produto disponível"
                    : "Selecione o produto",
                options: productOptions,
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
    [productOptions]
  );

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) formRef.current?.resetForm();
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    const componentProductId = extractValue(data.componentProductId);
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
