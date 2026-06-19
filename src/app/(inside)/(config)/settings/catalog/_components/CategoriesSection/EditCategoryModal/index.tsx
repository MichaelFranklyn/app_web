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
import { Pencil } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { ProductCategoryRow } from "../AddCategoryModal/interface";
import { categoriesRefetchQueries } from "../gql";
import { UPDATE_PRODUCT_CATEGORY_MUTATION } from "./gql";

interface UpdateProductCategoryResponse {
  updateProductCategory: {
    __typename?: "ProductCategoryTypeDataResponse";
    status: boolean;
    message: string;
    data: ProductCategoryRow | null;
  };
}

interface Props {
  category: ProductCategoryRow;
}

export function EditCategoryModal({ category }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);

  const [updateCategory] = useMutation<UpdateProductCategoryResponse>(
    UPDATE_PRODUCT_CATEGORY_MUTATION
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
                label: "Nome",
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

  const initialData = useMemo(
    () => ({
      name: category.name,
      segment: category.segment,
    }),
    [category]
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const input: Record<string, unknown> = {};
    const name = String(data.name ?? "").trim();
    if (name && name !== category.name) input.name = name;
    const segment = String(data.segment ?? "").trim();
    if (segment && segment !== category.segment) input.segment = segment;

    if (Object.keys(input).length === 0) {
      setOpen(false);
      return;
    }

    await execute(
      async () => {
        const res = await updateCategory({
          variables: { id: category.id, input },
          // Otimista: como o id é o mesmo, o Apollo atualiza a entidade
          // normalizada na hora (a linha da lista reflete de imediato). Em
          // erro, rollback automático.
          optimisticResponse: {
            updateProductCategory: {
              __typename: "ProductCategoryTypeDataResponse",
              status: true,
              message: "",
              data: {
                __typename: "ProductCategoryType",
                id: category.id,
                name: name || category.name,
                segment: segment || category.segment,
              },
            },
          },
          // Rede de segurança: ressincroniza a lista com o back após o sucesso.
          refetchQueries: categoriesRefetchQueries(),
        });

        if (
          !res.data?.updateProductCategory?.status ||
          !res.data.updateProductCategory.data
        ) {
          throw new Error(
            res.data?.updateProductCategory?.message ??
              "Erro ao atualizar categoria"
          );
        }

        return res.data.updateProductCategory.data;
      },
      {
        successMessage: "Categoria atualizada com sucesso",
        onSuccess: () => setOpen(false),
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="ghost" color="neutral" size="sm" isIconOnly>
          <Button.Icon icon={Pencil} />
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Editar categoria"
          description={`Altere os dados de "${category.name}".`}
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={steps}
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
