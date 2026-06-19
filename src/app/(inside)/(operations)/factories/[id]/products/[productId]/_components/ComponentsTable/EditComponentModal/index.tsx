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
import { UPDATE_PRODUCT_COMPONENT_MUTATION } from "../gql";
import { ProductComponentNode, UpdateComponentResponse } from "../interface";

interface Props {
  component: ProductComponentNode;
  onChanged: () => void;
}

export function EditComponentModal({ component, onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const [updateComponent] = useMutation<UpdateComponentResponse>(
    UPDATE_PRODUCT_COMPONENT_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "component",
        sections: [
          {
            id: "fields",
            fields: [
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
    []
  );

  const initialData = useMemo(
    () => ({ quantity: String(Number(component.quantity)) }),
    [component]
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const quantity = Number(String(data.quantity ?? "").replace(",", "."));

    if (quantity === Number(component.quantity)) {
      setOpen(false);
      return;
    }

    await execute(
      async () => {
        if (!Number.isFinite(quantity) || quantity <= 0) {
          throw new Error("Informe uma quantidade maior que zero.");
        }
        const res = await updateComponent({
          variables: { id: component.id, input: { quantity } },
        });
        if (!res.data?.updateProductComponent?.status) {
          throw new Error(
            res.data?.updateProductComponent?.message ??
              "Erro ao atualizar componente"
          );
        }
        return res.data.updateProductComponent;
      },
      {
        successMessage: "Componente atualizado com sucesso",
        onSuccess: async () => {
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
          title="Editar componente"
          description={`Altere a quantidade de "${component.component?.name ?? "componente"}" no kit.`}
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
