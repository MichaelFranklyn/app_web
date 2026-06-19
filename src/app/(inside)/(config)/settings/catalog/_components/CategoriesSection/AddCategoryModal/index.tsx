"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  buildCategoriesVariables,
  categoriesRefetchQueries,
  PRODUCT_CATEGORIES_QUERY,
  ProductCategoriesData,
} from "../gql";
import { CREATE_PRODUCT_CATEGORY_MUTATION } from "./gql";
import { CreateProductCategoryResponse } from "./interface";

export function AddCategoryModal() {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);

  const [createCategory] = useMutation<CreateProductCategoryResponse>(
    CREATE_PRODUCT_CATEGORY_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "category",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "name",
                type: "text",
                label: "Nome da categoria",
                required: true,
                placeholder: "Ex: Tubos e conexões, Cimento e argamassa",
              },
              {
                name: "segment",
                type: "text",
                label: "Segmento",
                required: true,
                placeholder: "Ex: Hidráulica, Estrutura, Elétrica",
              },
            ],
          },
        ],
      },
    ],
    []
  );

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) formRef.current?.resetForm();
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    const name = String(data.name ?? "").trim();
    const segment = String(data.segment ?? "").trim();

    await execute(
      async () => {
        const res = await createCategory({
          variables: { input: { name, segment } },
          // Otimista: a categoria aparece na lista na hora (id temporário).
          // Se a mutation falhar, o Apollo faz rollback automático.
          optimisticResponse: {
            createProductCategory: {
              __typename: "ProductCategoryTypeDataResponse",
              status: true,
              message: "",
              data: {
                __typename: "ProductCategoryType",
                id: `optimistic-${crypto.randomUUID()}`,
                name,
                segment,
              },
            },
          },
          // Rede de segurança: após o sucesso, ressincroniza a lista com o back.
          refetchQueries: categoriesRefetchQueries(),
          update: (cache, { data: result }) => {
            const created = result?.createProductCategory?.data;
            if (!created) return;
            cache.updateQuery<ProductCategoriesData>(
              {
                query: PRODUCT_CATEGORIES_QUERY,
                variables: buildCategoriesVariables(),
              },
              (existing) => {
                if (!existing) return existing;
                const list = existing.product_categories;
                if (list.edges.some((e) => e.node.id === created.id)) {
                  return existing;
                }
                return {
                  product_categories: {
                    ...list,
                    edges: [
                      ...list.edges,
                      { __typename: "ProductCategoryTypeEdge", node: created },
                    ],
                    totalCount: list.totalCount + 1,
                  },
                };
              }
            );
          },
        });

        if (
          !res.data?.createProductCategory?.status ||
          !res.data.createProductCategory.data
        ) {
          throw new Error(
            res.data?.createProductCategory?.message ??
              "Erro ao cadastrar categoria"
          );
        }

        return res.data.createProductCategory.data;
      },
      {
        successMessage: "Categoria cadastrada com sucesso",
        onSuccess: () => handleClose(false),
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="sm">
          <Button.Icon icon={Plus} />
          <Button.Title>Nova categoria</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Nova categoria"
          description="Adicione uma categoria de produto ao catálogo da empresa."
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
