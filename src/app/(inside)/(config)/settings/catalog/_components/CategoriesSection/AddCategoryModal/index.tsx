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
import { ProductCategoryRow } from "../gql";
import { CREATE_PRODUCT_CATEGORY_MUTATION } from "./gql";
import { CreateProductCategoryResponse } from "./interface";

interface Props {
  onAddOptimistic: (category: ProductCategoryRow) => void;
  onChanged: () => void;
}

export function AddCategoryModal({ onAddOptimistic, onChanged }: Props) {
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
        onSuccess: (created) => {
          handleClose(false);
          onAddOptimistic(created);
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
