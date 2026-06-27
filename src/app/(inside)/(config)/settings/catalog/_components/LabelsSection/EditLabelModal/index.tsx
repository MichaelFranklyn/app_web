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
import { UPDATE_PRODUCT_UNIT_LABEL_MUTATION } from "../../../gql";
import {
  EditLabelModalProps,
  UpdateProductUnitLabelResponse,
} from "./interface";

export function EditLabelModal({
  label,
  onUpdateOptimistic,
  onCommit,
  onRollback,
  onDone,
}: EditLabelModalProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const [updateLabel] = useMutation<UpdateProductUnitLabelResponse>(
    UPDATE_PRODUCT_UNIT_LABEL_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "label",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "label",
                type: "text",
                label: "Rótulo",
                required: true,
                placeholder: "Ex: Caixa, Pallet, Fardo",
              },
            ],
          },
        ],
      },
    ],
    []
  );

  const initialData = useMemo(() => ({ label: label.label }), [label]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    const value = String(data.label ?? "").trim();
    if (!value || value === label.label) {
      setOpen(false);
      return;
    }
    setOpen(false);
    onUpdateOptimistic(label.id, { label: value });

    await execute(
      async () => {
        const res = await updateLabel({
          variables: { id: label.id, input: { label: value } },
        });
        if (!res.data?.updateProductUnitLabel?.status) {
          throw new Error(
            res.data?.updateProductUnitLabel?.message ??
              "Erro ao atualizar rótulo"
          );
        }
        return res.data.updateProductUnitLabel;
      },
      {
        successMessage: "Rótulo atualizado",
        onSuccess: () => {
          onCommit();
          onDone();
        },
        onError: () => onRollback(),
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
          title="Editar rótulo"
          description={`Altere o rótulo "${label.label}".`}
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
