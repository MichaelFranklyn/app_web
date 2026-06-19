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
import { UPDATE_PRODUCT_TAX_MUTATION } from "../gql";

interface ProductTaxNode {
  __typename?: "ProductTaxType";
  id: string;
  rate: string;
  updatedAt: string;
  taxRule: {
    __typename?: "TaxRuleType";
    id: string;
    name: string;
  };
}

interface UpdateProductTaxResponse {
  updateProductTax: {
    __typename?: "ProductTaxTypeDataResponse";
    status: boolean;
    message: string;
    data: ProductTaxNode | null;
  };
}

interface Props {
  tax: ProductTaxNode;
  onChanged: () => void;
}

export function EditTaxModal({ tax, onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const [updateTax] = useMutation<UpdateProductTaxResponse>(
    UPDATE_PRODUCT_TAX_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "tax",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "rate",
                type: "text",
                label: "Alíquota (%)",
                required: true,
                placeholder: "Ex: 18.00",
              },
            ],
          },
        ],
      },
    ],
    []
  );

  const initialData = useMemo(
    () => ({ rate: String(Number(tax.rate).toFixed(2)) }),
    [tax.rate]
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const rate = Number(String(data.rate ?? "").replace(",", "."));
    if (Number.isNaN(rate)) return;

    await execute(
      async () => {
        const res = await updateTax({
          variables: { id: tax.id, input: { rate } },
          // Otimista: mesma entidade (id), o Apollo atualiza a linha na hora.
          optimisticResponse: {
            updateProductTax: {
              __typename: "ProductTaxTypeDataResponse",
              status: true,
              message: "",
              data: {
                __typename: "ProductTaxType",
                id: tax.id,
                rate: String(rate),
                updatedAt: new Date().toISOString(),
                taxRule: { __typename: "TaxRuleType", ...tax.taxRule },
              },
            },
          },
        });

        if (
          !res.data?.updateProductTax?.status ||
          !res.data.updateProductTax.data
        ) {
          throw new Error(
            res.data?.updateProductTax?.message ?? "Erro ao atualizar alíquota"
          );
        }
        return res.data.updateProductTax.data;
      },
      {
        successMessage: "Alíquota atualizada com sucesso",
        onSuccess: () => {
          setOpen(false);
          onChanged();
        },
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

      <Modal.Content size="sm">
        <Modal.Header
          title="Editar alíquota"
          description={`Altere a alíquota do imposto "${tax.taxRule.name}".`}
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
